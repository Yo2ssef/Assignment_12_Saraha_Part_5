import { OAuth2Client } from 'google-auth-library';
import { UserModel } from '../../database/models/index.js';
import { createOne, findOne } from '../../common/repository/index.js';
import { ConflictException, NotFoundException, tooManyRequestException, UnauthorizedException } from '../../common/executions/error.exception.js';
import { compareHash, createLoginCredentials, createRevokeToken, encrypt, hash, userBaseRevokeTokenKey } from '../../common/security/index.js';
import { ACCESS_TOKEN_EXPIRES_IN, WEB_CLIENT_ID } from '../../config/config.js';
import { logOutEnum, ProviderUserEnum, EmailSubjectEnums } from '../../common/enums/index.js';
import { del, expire, get, incrBy, keys, set, ttl } from '../../common/services/index.js';
import { createNumberOtp, emailEvent } from '../../common/utils/index.js';

const userEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::Otp`
}
const userEmailTrialsKey = ({ email, subject }) => {
    return `${userEmailKey({ email, subject })}::Trials`
}
const userEmailBlockKey = ({ email }) => {
    return `User::${email}::Block::Count`
}
const sendEmailOTP = async ({
    email,
    subject,
    expiresIn = 120,
    maxTrials = 3,
    blockInSeconds = (600 + expiresIn)
} = {}) => {
    const existOtpTtl = await ttl({ key: userEmailKey({ email, subject }) })
    if (existOtpTtl > 0) {
        throw ConflictException(`You can request a new code after ${existOtpTtl} seconds.`)
    }

    const oldTrials = await get({ key: userEmailTrialsKey({ email, subject }) }) ?? 0
    if (oldTrials >= maxTrials) {
        const blockTtl = await ttl({ key: userEmailTrialsKey({ email, subject }) })
        throw tooManyRequestException(
            `You have exceeded the maximum number of attempts. Please try again after ${blockTtl} seconds.`
        )
    }

    const otp = createNumberOtp()
    await set({
        key: userEmailKey({ email, subject }),
        value: await hash(otp),
        ttl: expiresIn
    })

    const currentTrials = await incrBy({ key: userEmailTrialsKey({ email, subject }) })
    if (currentTrials == maxTrials) {
        await expire({
            key: userEmailTrialsKey({ email, subject }),
            ttl: blockInSeconds
        })
    }

    emailEvent.emit("sendEmail", {
        recipients: { to: email },
        subject,
        data: { code: otp }
    })
}
const handleFailedLogin = async ({ email }) => {
    const attempts = await incrBy({ key: userEmailBlockKey({ email }) })
    if (attempts === 5) await expire({ key: userEmailBlockKey({ email }), ttl: 300 })
    throw NotFoundException("Invalid email or password or email not confirmed.")
}

const client = new OAuth2Client();
async function verifyGmail(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload.email_verified) throw BadRequestException("Email not verified.")
        return payload
    } catch (error) {
        throw UnauthorizedException("Invalid or expired google token.", error)
    }
}

export const signUpAndLoginWithGmail = async ({ idToken }, issuer) => {
    const { name, email, picture } = await verifyGmail(idToken)
    const existsAccount = await findOne({
        model: UserModel,
        filter: { email }
    })

    if (existsAccount) {
        if (existsAccount.provider !== ProviderUserEnum.GOOGLE) {
            throw ConflictException("Invalid account provider.")
        }
        return { status: 200, data: await createLoginCredentials({ user: existsAccount, issuer }) }
    }

    const user = await createOne({
        model: UserModel,
        data: {
            email,
            userName: name,
            provider: ProviderUserEnum.GOOGLE,
            confirmEmail: new Date(),
            image: picture
        }
    })
    return { status: 201, data: await createLoginCredentials({ user, issuer }) }
}

export const signUp = async ({ userName, email, password, gender, dataOfBirth, phone }) => {
    const duplicatedEmail = await findOne({
        model: UserModel,
        filter: { email }
    })
    if (duplicatedEmail) throw ConflictException("Email already exists.")

    const data = await createOne({
        model: UserModel,
        data: {
            userName,
            email,
            password: await hash(password),
            gender,
            dataOfBirth,
            phone: await encrypt(phone)
        }
    })
    sendEmailOTP({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL })
    return data
}

export const resendConfirmEmail = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderUserEnum.SYSTEM,
            confirmEmail: { $exists: false }
        }
    })
    if (!account) throw ConflictException("Account not found or already confirmed.")
    await sendEmailOTP({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL })
}

export const confirmEmail = async ({ email, otp }) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderUserEnum.SYSTEM,
            confirmEmail: { $exists: false }
        }
    })
    if (!account) throw NotFoundException("Account not found or already confirmed.")

    const hashOtp = await get({ key: userEmailKey({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL }) })
    if (!hashOtp || !await compareHash(otp, hashOtp)) throw ConflictException("Invalid or expired confirm email code.")

    account.confirmEmail = new Date()
    await account.save()
    await del({
        key: await keys({ prefix: userEmailKey({ email, subject: EmailSubjectEnums.CONFIRM_EMAIL }) })
    })
    return account
}

export const requestForgotPasswordCode = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderUserEnum.SYSTEM,
            confirmEmail: { $exists: true }
        }
    })
    if (!account) throw ConflictException("Account not found or not confirmed.")
    await sendEmailOTP({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD, expiresIn: 180 })
}

export const verifyForgotPasswordCode = async ({ email, otp }) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderUserEnum.SYSTEM,
            confirmEmail: { $exists: true }
        }
    })
    if (!account) throw NotFoundException("Account not found or not confirmed.")

    const hashOtp = await get({ key: userEmailKey({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD }) })
    if (!hashOtp || !await compareHash(otp, hashOtp)) throw ConflictException("Invalid or expired forgot password code.")
    return account
}

export const resetPassword = async ({ email, otp, password }) => {
    const account = await verifyForgotPasswordCode({ email, otp })
    account.password = await hash(password)
    account.changeCredentialsTime = Date.now()
    await account.save()
    const result = await Promise.all([
        keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
        keys({ prefix: userEmailKey({ email, subject: EmailSubjectEnums.FORGOT_PASSWORD }) })
    ])
    await del({
        key: [...result[0], ...result[1]]
    })
    return account
}

export const login = async ({ email, password }, issuer) => {
    const loginAttempts = await get({ key: userEmailBlockKey({ email }) }) ?? 0
    if (loginAttempts >= 5) {
        const blockTtl = await ttl({ key: userEmailBlockKey({ email }) })
        throw tooManyRequestException(
            `You have exceeded the maximum number of login attempts. Please try again after ${blockTtl} seconds.`
        )
    }

    const user = await findOne({
        model: UserModel,
        filter: { email, confirmEmail: { $exists: true } },
    })
    if (!user) return await handleFailedLogin({ email })


    const match = await compareHash(password, user.password)
    if (!match) return await handleFailedLogin({ email })

    await del({ key: userEmailBlockKey({ email }) })

    if (user?.twoFactorAuth) {
        await sendEmailOTP({
            email: user.email,
            subject: EmailSubjectEnums.CONFIRM_LOGIN_2FA
        })
        return { message: "Please confirm 2FA code to complete login." }
    }
    return await createLoginCredentials({ user, issuer })
}

export const rotateToken = async (user, payload, issuer) => {
    const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const currentTime = Date.now() + (5 * 60000)
    if (currentTime < accessExpiresIn) throw ConflictException("Sorry we cannot create new login credentials while current access token still within valid time range")
    const data = await createLoginCredentials({ user, issuer })
    await createRevokeToken({ payload })
    return data
}

export const send2faEnableCode = async (user, { password }) => {
    const match = await compareHash(password, user.password)
    if (!match) throw NotFoundException("Invalid password.")
    await sendEmailOTP({
        email: user.email,
        subject: EmailSubjectEnums.ENABLE_2FA,
        expiresIn: 300,
    })
    return user
}

export const confirm2faCode = async (user, { otp }) => {
    const hashOtp = await get({ key: userEmailKey({ email: user.email, subject: EmailSubjectEnums.ENABLE_2FA }) })
    if (!hashOtp || !await compareHash(otp, hashOtp)) throw ConflictException("Invalid or expired 2FA code.")
    user.twoFactorAuth = Date.now()
    user.changeCredentialsTime = new Date()
    await user.save()
    const result = await Promise.all([
        keys({ prefix: userBaseRevokeTokenKey({ userId: user._id }) }),
        keys({ prefix: userEmailKey({ email: user.email, subject: EmailSubjectEnums.ENABLE_2FA }) })
    ])
    await del({
        key: [...result[0], ...result[1]]
    })
    return user
}

export const confirmLogin2faCode = async ({ email, password, otp }, issuer) => {
    const user = await findOne({
        model: UserModel,
        filter: { email, twoFactorAuth: { $exists: true } },
    })
    if (!user) throw NotFoundException("Invalid email or password or 2FA not enabled.")

    const match = await compareHash(password, user.password)
    if (!match) throw NotFoundException("Invalid email or password or 2FA not enabled.")

    const hashOtp = await get({ key: userEmailKey({ email: user.email, subject: EmailSubjectEnums.CONFIRM_LOGIN_2FA }) })
    if (!hashOtp || !await compareHash(otp, hashOtp)) throw ConflictException("Invalid or expired 2FA code.")

    await del({
        key: await keys({ prefix: userEmailKey({ email: user.email, subject: EmailSubjectEnums.CONFIRM_LOGIN_2FA }) })
    })
    return await createLoginCredentials({ user, issuer })
}

export const logOut = async (user, payload, { action }) => {
    let message;
    switch (action) {
        case logOutEnum.ALL:
            user.changeCredentialsTime = Date.now()
            user.save()
            const sessionsUser = await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) }) ?? []
            if (sessionsUser.length) await del({ key: sessionsUser })
            message = "Logged out from all sessions successfully."
            break;
        default:
            await createRevokeToken({ payload })
            message = "Logged out from current session successfully."
            break;
    }
    return { user, message }
}