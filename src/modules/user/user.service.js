import { find, findByIdAndUpdate } from '../../common/repository/index.js';
import { decrypt, encrypt } from '../../common/security/index.js';
import { UserModel } from '../../database/models/index.js';

export const profile = async (user) => {
    user.phone = await decrypt(user?.phone)
    user.role = undefined
    user.password = undefined
    user.confirmEmail = undefined
    user.changeCredentialsTime = undefined
    user.provider = undefined
    return user
}

export const uploadProfileImage = async (user, file) => {
    user.image = file
    await user.save()
    return user
}

export const updateUser = async (payload, data) => {
    if (data?.phone) data.phone = await encrypt(data.phone)

    const user = await findByIdAndUpdate({
        model: UserModel,
        id: payload?.sub,
        update: data,
        options: {
            select: "-password -role -provider -changeCredentialsTime -confirmEmail"
        }
    })
    user.phone = await decrypt(user?.phone)
    return user
}

export const allUsers = async () => {
    const users = await find({
        model: UserModel,
        select: "-password"
    })

    users.phone = ((users.map(async (user) => {
        user.phone = await decrypt(user?.phone);
        return user
    })))
    return users
}