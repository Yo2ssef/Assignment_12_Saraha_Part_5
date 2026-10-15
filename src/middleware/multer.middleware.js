import { BadRequestException } from '../common/executions/error.exception.js';
import { processMulterUpload } from '../common/utils/index.js';

const hasUploadedFiles = (req) => {
    if (req.file) return true
    if (Array.isArray(req.files)) return req.files.length > 0
    if (req.files !== null && req.files && typeof req.files === "object") {
        return Object.values(req.files).some(
            (files) => Array.isArray(files) && files.length > 0
        );
    }
    return false;
};

export const uploadMiddleware = ({
    isRequired = true,
    multerMiddleware,
    customPath = "general",
    validation = []
}) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message,), { cause: { status: 400 } })
                return;
            }
            try {
                if (isRequired && hasUploadedFiles(req)) {
                    next(BadRequestException("File is required."))
                    return;
                }
                await processMulterUpload({ req, customPath, validation })
                next()
            } catch (error) {
                next(new Error(error.message), { cause: { status: 500 } })
            }
        })
    }
}