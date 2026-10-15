import { languageEnum, TokenTypeEnum } from '../common/enums/index.js';
import { BadRequestException, ForbiddenException } from '../common/executions/error.exception.js';
import { decodeToken } from '../common/security/index.js';
import { tokenSchema } from '../modules/user/user.validation.js';
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const lang = req.headers["accept-language"] ?? languageEnum.EN
        const token = req.headers["authorization"]
        const validateData = tokenSchema(lang).safeParse({ token })
        
        if (!validateData.success) throw BadRequestException("Validation Error.", validateData.error.issues)

        const { user, payload } = await decodeToken({ token, tokenType })
        req.user = user
        req.payload = payload
        next()
    }
}

export const checkAuthentication = (req, res, next) => {
    if (!req.headers["authorization"]) return next();
    return authentication()(req, res, next);
};

export const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) throw ForbiddenException("You are not authorized to access this resource.")
        next()
    }
}