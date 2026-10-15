import Router from 'express';
import { authentication, authorization, uploadMiddleware, validation } from '../../middleware/index.js';
import { fileValidation, localFileUpload, successResponse } from '../../common/utils/index.js';
import { RoleUserEnum } from '../../common/enums/index.js';
import { allUsers, updateUser, profile, uploadProfileImage } from './user.service.js';
import { userDataSchemaToUpdate } from './user.validation.js';
const router = Router()

router.get("/", authentication(), async (req, res, next) => {
    const data = await profile(req.user)
    successResponse({ res, data })
})

router.patch("/profile-image",
    authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 2 }).single("avatar"),
        customPath: "users",
        validation: fileValidation.image
    }), async (req, res, next) => {
        const data = await uploadProfileImage(req.user, req.file?.finalPath)
        successResponse({ res, message: "Profile image uploaded successfully." })
    })

router.patch("/", validation(userDataSchemaToUpdate), authentication(), async (req, res, next) => {
    const data = await updateUser(req.payload, req.validated.body)
    successResponse({ res, message: "Updated successfully.", data })
})

router.get("/all", authentication(), authorization(RoleUserEnum.ADMIN), async (req, res, next) => {
    const data = await allUsers()
    successResponse({ res, data })
})

export default router