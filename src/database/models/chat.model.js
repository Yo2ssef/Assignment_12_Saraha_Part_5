import mongoose from 'mongoose';

const messageChatSchema = new mongoose.Schema(
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
            ref: "User",
            required: true
        }
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

const chatSchema = new mongoose.Schema(
    {
        originalMessageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true
        },
        users: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                }
            ],
            required: true,
            validate: {
                validator: (users) =>
                    users.length === 2 &&
                    users[0].toString() !== users[1].toString(),
                message: "A chat must have two different users."
            }
        },
        messages: {
            type: [messageChatSchema],
            default: []
        }
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "CHAT_DB"
    }
)

export const ChatModel = mongoose.models.Chat || mongoose.model("Chat", chatSchema)