import nodemailer from 'nodemailer';
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from '../../../config/config.js';
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});

export const sendEmail = async ({
    to,
    cc,
    bbc,
    subject,
    text,
    html,
    attachments = []
} = {}) => {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) throw BadRequestException("Missing recipient email address.");
        if (!text?.length && !html?.length && !attachments?.length) throw BadRequestException("Missing email content.");
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${APP_EMAIL}>`,
            to,
            cc,
            bbc,
            subject,
            text,
            html,
            attachments,
        });
        console.log("Message sent:", info.messageId);
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log("Error while sending mail:", error);
    }
}