import z from 'zod';
import { generalValidationFields } from '../../common/validation.js';
import { languageEnum, logOutEnum } from '../../common/enums/index.js';
const { email, password, userName, phone, dateOfBirth, gender, otp } = generalValidationFields;

const login = (lang) => {
    return z.strictObject({
        email: email(lang),
        password: password(lang),
    })
}
export const loginSchema = (lang) => {
    return z.object({
        body: login(lang)
    })
}
export const signUpSchema = (lang) => {
    return z.object({
        body: login(lang).extend({
            userName: userName(lang),
            confirmPassword: password(lang),
            phone: phone(lang).optional(),
            dateOfBirth: dateOfBirth(lang).optional(),
            gender: gender(lang).optional(),
        }).refine((data) => {
            return data.password == data.confirmPassword
        }, {
            error: lang == languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    })
}
export const resendConfirmEmailSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            email: email(lang)
        })
    })
}
export const confirmEmailSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            email: email(lang),
            otp: otp(lang),
        })
    })
}
export const resetPasswordSchema = (lang) => {
    return z.object({
        body: login(lang).extend({
            otp: otp(lang),
            confirmPassword: password(lang)
        }).refine((data) => {
            return data.password == data.confirmPassword
        }, {
            error: lang == languageEnum.EN ?
                "Password and confirmPassword not equal." :
                "كلمة المرور و تأكيد كلمة المرور غير متطابقين."
        })
    })
}
export const enable2faSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            password: password(lang)
        })
    })
}
export const confirm2faSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            otp: otp(lang)
        })
    })
}
export const confirmLogin2faSchema = (lang) => {
    return z.object({
        body: login(lang).extend({
            otp: otp(lang),
        })
    })
}
export const logOutSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            action: z.enum(logOutEnum, {
                error: lang == languageEnum.EN ?
                    "Invalid action." :
                    "إجراء غير صالح."
            })
        }).default(logOutEnum.ONE)
    })
}
