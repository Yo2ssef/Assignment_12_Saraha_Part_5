import { z } from 'zod';
import { generalValidationFields } from '../../common/validation.js';
import { TypeMessages } from '../../common/enums/index.js';
const { id, file, content } = generalValidationFields;

const idSchema = (field, lang) => {
    return z.strictObject({
        [field]: id(lang),
    })
}
const messageId = (lang) => { return idSchema("messageId", lang) }
const chatId = (lang) => { return idSchema("chatId", lang) }

export const createMessageSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            content: content(lang).optional(),
            receiverId: id(lang)
        }),
        files: z.array(file(lang)).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            })
        }
    })
}
export const getAllMessagesSchema = (lang) => {
    return z.object({
        query: z.strictObject({
            type: z.enum(TypeMessages).default(TypeMessages.RECEIVER),
            page: z.coerce.number().default(1),
            limit: z.coerce.number().default(5),
        }),
    })
}
export const getOrDeleteOneMessageSchema = (lang) => {
    return z.object({
        params: messageId(lang)
    })
}
export const respondToIdentitySchema = (lang) => {
    return z.object({
        params: messageId(lang),
        body: z.strictObject({
            isApproved: z.boolean()
        })
    })
}
export const chatIdSchema = (lang) => {
    return z.object({
        params: chatId(lang)
    })
}
export const createMessageChatSchema = (lang) => {
    return z.object({
        params: chatId(lang),
        body: z.strictObject({
            content: content(lang).optional(),
        }),
        files: z.array(file(lang)).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content", "files"],
                message: "Message content or file attachment is required."
            })
        }
    })
}