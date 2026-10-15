import mongoose from 'mongoose';
import { IdentityRequestStatusEnum } from '../../common/enums/index.js';

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            minLength: 2,
            maxLength: 50000,
            required: function () { return this.attachments?.length > 0 ? false : true }
        },
        attachments: [String],
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        identityRequestStatus: {
            type: Number,
            enum: Object.values(IdentityRequestStatusEnum),
        },
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "MESSAGES_DB"
    }
)

export const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema)