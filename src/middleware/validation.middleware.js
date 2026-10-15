import { languageEnum } from '../common/enums/index.js';
import { BadRequestException } from '../common/executions/error.exception.js';
export const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers["accept-language"] ?? languageEnum.EN)
        const validationData = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            file: req.file,
            files: req.files
        })
        if (!validationData.success) throw BadRequestException("Validation Error.", validationData.error.issues)
        req.validated = validationData.data
        next()
    }
}