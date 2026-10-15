import { EventEmitter } from 'node:events';
import { sendEmail, verifyEmailTemplate } from './index.js';
export const emailEvent = new EventEmitter()
emailEvent.on("sendEmail", async ({
    recipients,
    subject,
    data,
} = {}) => {
    try {
        await sendEmail({
            ...recipients,
            subject,
            html: verifyEmailTemplate({
                subject,
                code: data?.code,
            }),
        })
    } catch (error) {
        console.log("Error while sending mail:", error);
    }
})