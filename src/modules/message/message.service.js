import { IdentityRequestStatusEnum } from '../../common/enums/index.js';
import { BadRequestException, ConflictException, NotFoundException } from '../../common/executions/error.exception.js';
import { createOne, deleteOne, find, findById, findOne, findOneAndUpdate, paginate } from '../../common/repository/index.js';
import { decrypt } from '../../common/security/index.js';
import { ChatModel, MessageModel, UserModel } from '../../database/models/index.js';

const getMessageFilter = ({ type, userId }) => {
    if (type === "0") return { senderId: userId };
    if (type === "1") return { receiverId: userId };
    return {
        $or: [{ senderId: userId }, { receiverId: userId }]
    };
}
const statusName = (key) => {
    let status;
    switch (key) {
        case 0:
            status = "Pending";
            break;
        case 1:
            status = "Rejected";
            break;
        case 2:
            status = "Accepted";
            break;
        default:
            break;
    }
    return status;
}
const getMessageWithSender = async (message) => {
    let senderAccount = undefined
    if (message.identityRequestStatus >= IdentityRequestStatusEnum.ACCEPTED) {
        senderAccount = await findById({
            model: UserModel,
            id: message.senderId,
            select: "-password -provider -confirmEmail -role"
        })
        if (senderAccount) senderAccount.phone = await decrypt(senderAccount.phone)
    }
    return { message, senderAccount }
}

export const createMessage = async ({ content, receiverId }, files = [], user = undefined) => {
    if (user && user._id.toString() === receiverId) throw BadRequestException("You cannot send a message to yourself.")
    const checkReceiverId = await findById({
        model: UserModel,
        id: receiverId
    })
    if (!checkReceiverId) throw NotFoundException("Receiver not found.")
        
    const message = await createOne({
        model: MessageModel,
        data: {
            receiverId,
            content,
            attachments: files.map(element => element.path),
            ...(user && { senderId: user._id })
        }
    })
    return message
}

export const revealUserIdentity = async (user, { messageId }) => {
    const message = await findOneAndUpdate({
        model: MessageModel,
        filter: {
            _id: messageId,
            receiverId: user._id,
            identityRequestStatus: null
        },
        update: {
            $set: {
                identityRequestStatus: IdentityRequestStatusEnum.PENDING
            }
        }
    })
    if (message) return message

    const existingMessage = await findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            receiverId: user._id
        }
    })
    if (!existingMessage) throw NotFoundException("Message not found. or you are not the receiver of this message.")

    throw ConflictException(
        `You have already submitted an identity request for this message. Current status: ${statusName(existingMessage.identityRequestStatus)}`
    )
}

export const getAllMessages = async ({ type, page, limit }, user) => {
    const filter = getMessageFilter({ type, userId: user._id })
    const data = await paginate({
        model: MessageModel,
        filter,
        page,
        limit,
        options: { sort: { createdAt: 1 } }
    })
    data.data = await Promise.all(data.data.map(getMessageWithSender))
    return { data }
}

export const getMessage = async (user, { messageId }) => {
    const message = await findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            receiverId: user._id
        }
    })
    if (!message) throw NotFoundException("Message not found. or you not the receiver of this message.")
    const { senderAccount } = await getMessageWithSender(message)
    return { message, senderAccount }
}

export const deleteMessage = async (user, { messageId }) => {
    const data = await deleteOne({
        model: MessageModel,
        filter: { receiverId: user._id, _id: messageId }
    })
    if (!data.deletedCount) throw NotFoundException("Message not found.")
    return data
}

export const getMessagesRequestingIdentity = async (user) => {
    const messages = await find({
        model: MessageModel,
        filter: {
            senderId: user._id,
            identityRequestStatus: IdentityRequestStatusEnum.PENDING
        }
    })
    return messages
}

export const respondToIdentityRequest = async (user, { messageId }, { isApproved }) => {
    const messageIdentityRequest = await findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            senderId: user._id,
            identityRequestStatus: IdentityRequestStatusEnum.PENDING
        }
    })
    if (!messageIdentityRequest) throw NotFoundException(
        "Message not found. or you not the sender of this message. or the identity request has already been responded to."
    )

    if (!isApproved) {
        messageIdentityRequest.identityRequestStatus = IdentityRequestStatusEnum.REJECTED
        await messageIdentityRequest.save()
        return { message: "Identity request rejected." }
    }

    messageIdentityRequest.identityRequestStatus = IdentityRequestStatusEnum.ACCEPTED
    await messageIdentityRequest.save()
    const chat = await createOne({
        model: ChatModel,
        data: {
            originalMessageId: messageIdentityRequest._id,
            users: [messageIdentityRequest.senderId, messageIdentityRequest.receiverId],
        }
    });

    return { message: "Identity request approved." }
}

export const getChatsUser = async (user) => {
    const data = await find({
        model: ChatModel,
        filter: {
            users: user._id
        },
        select: "_id users"
    })
    return data
}

export const getChatUser = async (user, { chatId }) => {
    const chat = await findOne({
        model: ChatModel,
        filter: {
            _id: chatId,
            users: user._id
        }
    })
    if (!chat) throw NotFoundException("Chat not found. or you are not a participant of this chat.")
    return chat
}

export const createMessageChat = async (user, { chatId }, { content }, files = []) => {
    const message = await findOneAndUpdate({
        model: ChatModel,
        filter: {
            _id: chatId,
            users: user._id
        },
        update: {
            $push: {
                messages: {
                    senderId: user._id,
                    content,
                    attachments: files.map(element => element.path),
                }
            }
        }
    })
    if (!message) throw NotFoundException("Chat not found. or you are not a participant of this chat.")
    return message
}