const nodemailer = require("nodemailer");

let transporter;

async function initializeTransporter() {

    console.log("HOST:", process.env.SMTP_HOST);
    console.log("PORT:", process.env.SMTP_PORT);
    console.log("USER:", process.env.SMTP_USER);
    console.log("PASSWORD EXISTS:", !!process.env.SMTP_PASSWORD);

    transporter = nodemailer.createTransport({

        host: process.env.SMTP_HOST,

        port: Number(process.env.SMTP_PORT),

        secure: false,

        auth: {

            user: process.env.SMTP_USER,

            pass: process.env.SMTP_PASSWORD

        }

    });

}

async function sendEmail(

    to,

    subject,

    html,

    attachments = []

) {

    if (!transporter) {

        await initializeTransporter();

    }

    const info = await transporter.sendMail({

        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,

        to,

        subject,

        html,

        attachments

    });

    console.log("From:", `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`);

    console.log("Email Sent Successfully");
    console.log(info.messageId);

}

module.exports = {

    sendEmail

};