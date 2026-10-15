import Router from 'express';
import { fileValidation, localFileUpload, successResponse } from '../../common/utils/index.js';
import { authentication, checkAuthentication, uploadMiddleware, validation } from '../../middleware/index.js';
import { chatIdSchema, createMessageChatSchema, createMessageSchema, getAllMessagesSchema, getOrDeleteOneMessageSchema, respondToIdentitySchema } from './message.validation.js';
import { createMessage, createMessageChat, deleteMessage, getAllMessages, getChatUser, getChatsUser, getMessage, getMessagesRequestingIdentity, respondToIdentityRequest, revealUserIdentity } from './message.service.js';
const router = Router()

router.post("/",
    checkAuthentication,
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 2 }).any("attachments", 3),
        customPath: "message",
        validation: fileValidation.image
    }), validation(createMessageSchema), async (req, res, next) => {
        const data = await createMessage(req.validated.body, req.validated.files, req.user)
        successResponse({ res, status: 201, message: "Message sent successfully.", data })
    })

router.post("/reveal-identity/:messageId", validation(getOrDeleteOneMessageSchema), authentication(), async (req, res, next) => {
    const data = await revealUserIdentity(req.user, req.validated.params)
    successResponse({ res, status: 201, message: "Identity request submitted successfully." })
})

router.get("/", validation(getAllMessagesSchema), authentication(), async (req, res, next) => {
    const data = await getAllMessages(req.validated.query, req.user)
    successResponse({ res, data })
})

router.get("/requests-identity", authentication(), async (req, res, next) => {
    const data = await getMessagesRequestingIdentity(req.user)
    successResponse({ res, message: data.length ? "Success." : "No messages requesting identity found.", data })
})

router.patch("/respond-identity/:messageId", validation(respondToIdentitySchema), authentication(), async (req, res, next) => {
    const { message } = await respondToIdentityRequest(req.user, req.validated.params, req.validated.body)
    successResponse({ res, message })
})

router.get("/chat", authentication(), async (req, res, next) => {
    const data = await getChatsUser(req.user)
    successResponse({ res, data })
})

router.get("/chat/:chatId", validation(chatIdSchema), authentication(), async (req, res, next) => {
    const data = await getChatUser(req.user, req.validated.params)
    successResponse({ res, data })
})

router.post("/chat/:chatId", authentication(),
    uploadMiddleware({
        isRequired: false,
        multerMiddleware: localFileUpload({ maxFileSize: 2 }).any("attachments", 3),
        customPath: "chat",
        validation: fileValidation.image
    }), validation(createMessageChatSchema), async (req, res, next) => {
        const data = await createMessageChat(
            req.user,
            req.validated.params,
            req.validated.body,
            req.validated.files
        )
        successResponse({ res, status: 201, message: "Message sent successfully.", })
    })

router.get("/:messageId", validation(getOrDeleteOneMessageSchema), authentication(), async (req, res, next) => {
    const data = await getMessage(req.user, req.validated.params)
    successResponse({ res, data })
})

router.delete("/:messageId", validation(getOrDeleteOneMessageSchema), authentication(), async (req, res, next) => {
    const data = await deleteMessage(req.user, req.validated.params)
    successResponse({ res, message: "Message deleted successfully" })
})

export default router