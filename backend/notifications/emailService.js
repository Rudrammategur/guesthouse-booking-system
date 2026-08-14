const nodemailer = require("nodemailer");

let transporter;

async function initializeTransporter() {

    console.log("========== SMTP INITIALIZATION ==========");

    console.log("SMTP HOST:", process.env.SMTP_HOST);
    console.log("SMTP PORT:", process.env.SMTP_PORT);
    console.log("SMTP USER:", process.env.SMTP_USER);
    console.log(
        "SMTP PASSWORD EXISTS:",
        !!process.env.SMTP_PASSWORD
    );

    transporter = nodemailer.createTransport({

        host: process.env.SMTP_HOST,

        port: Number(process.env.SMTP_PORT),

        secure: Number(process.env.SMTP_PORT) === 465,

        auth: {

            user: process.env.SMTP_USER,

            pass: process.env.SMTP_PASSWORD

        }

    });

    try {

        await transporter.verify();

        console.log("SMTP connection verified successfully");

    } catch (error) {

        console.error("SMTP verification failed:");
        console.error(error);

        throw error;

    }

}

async function sendEmail(
    to,
    subject,
    html,
    attachments = [],
    cc = []
) {

    if (!transporter) {

        await initializeTransporter();

    }

    console.log("========== SENDING EMAIL ==========");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);

    const info = await transporter.sendMail({

    from:
        `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,

    to,

    cc,

    subject,

    html,

    attachments

});
    console.log("FROM:",
        `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`
    );

    console.log("EMAIL SENT SUCCESSFULLY");

    console.log("MESSAGE ID:", info.messageId);

    return info;

}

module.exports = {
    sendEmail
};