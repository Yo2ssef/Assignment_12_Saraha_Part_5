import Router from 'express';
import { successResponse } from '../../common/utils/index.js';
import { signUp, login, signUpAndLoginWithGmail, logOut, rotateToken, confirmEmail, resendConfirmEmail, requestForgotPasswordCode, verifyForgotPasswordCode, resetPassword, send2faEnableCode, confirm2faCode, confirmLogin2faCode } from './auth.service.js';
import { authentication, validation } from '../../middleware/index.js';
import { loginSchema, logOutSchema, signUpSchema, confirmEmailSchema, resendConfirmEmailSchema, resetPasswordSchema, enable2faSchema, confirm2faSchema, confirmLogin2faSchema } from './auth.validation.js';
import { issuerLink } from '../../common/security/index.js';
import { TokenTypeEnum } from '../../common/enums/index.js';
const router = Router()

router.post("/signup-login-with-gmail", async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const { status, data } = await signUpAndLoginWithGmail(req.body, issuer)
    successResponse({ res, status, message: "Successfully logged in.", data })
})

router.post("/signup", validation(signUpSchema), async (req, res, next) => {
    const data = await signUp(req.validated.body)
    successResponse({ res, status: 201, message: "Successfully signed up. Please confirm your email." })
})

router.post("/resend-confirm-email", validation(resendConfirmEmailSchema), async (req, res, next) => {
    const data = await resendConfirmEmail(req.validated.body)
    successResponse({ res, message: "Successfully sent email confirmation code." })
})

router.post("/confirm-email", validation(confirmEmailSchema), async (req, res, next) => {
    const data = await confirmEmail(req.validated.body)
    successResponse({ res, message: "Successfully confirmed email." })
})

router.post("/request-forgot-password", validation(resendConfirmEmailSchema), async (req, res, next) => {
    const data = await requestForgotPasswordCode(req.validated.body)
    successResponse({ res, message: "Successfully sent forgot password code." })
})

router.post("/verify-forgot-password", validation(confirmEmailSchema), async (req, res, next) => {
    const data = await verifyForgotPasswordCode(req.validated.body)
    successResponse({ res, message: "Successfully verified forgot password code." })
})

router.patch("/reset-forgot-password", validation(resetPasswordSchema), async (req, res, next) => {
    const data = await resetPassword(req.validated.body)
    successResponse({ res, status: 201, message: "Successfully reset password." })
})

router.post("/login", validation(loginSchema), async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const { accessToken, refreshToken, message } = await login(req.validated.body, issuer)
    successResponse({
        res,
        message: message || "Successfully logged in.",
        data: message ? undefined : { accessToken, refreshToken }
    })
})

router.post("/send-2fa-code", validation(enable2faSchema), authentication(), async (req, res, next) => {
    const data = await send2faEnableCode(req.user, req.validated.body)
    successResponse({ res, message: "Successfully sent 2FA code." })
})

router.post("/confirm-2fa-code", validation(confirm2faSchema), authentication(), async (req, res, next) => {
    const data = await confirm2faCode(req.user, req.validated.body)
    successResponse({ res, status: 201, message: "Successfully confirmed 2FA code." })
})

router.post("/confirm-login-2fa", validation(confirmLogin2faSchema), async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const data = await confirmLogin2faCode(req.validated.body, issuer)
    successResponse({ res, message: "Successfully logged in.", data })
})

router.post("/rotate-token", authentication(TokenTypeEnum.REFRESH), async (req, res, next) => {
    const issuer = issuerLink({ protocol: req.protocol, host: req.host })
    const data = await rotateToken(req.user, req.payload, issuer)
    successResponse({ res, status: 201, data })
})

router.post("/logout", validation(logOutSchema), authentication(), async (req, res, next) => {
    const { user, message } = await logOut(req.user, req.payload, req.validated.body)
    successResponse({ res, message })
})

export default router