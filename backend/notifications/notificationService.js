const { sendEmail } = require("./emailService");

const bookingSubmitted =
require("../templates/bookingSubmitted");

const bookingVerified = require ("../templates/bookingVerified");




exports.sendBookingSubmitted = async (

    email,

    data

) => {

    const template = bookingSubmitted(data);

    const path = require("path");

    await sendEmail(

        email,

        template.subject,

        template.html,

        [

        {

            filename: "iit-dharwad-logo.png",

            path: path.join(
                __dirname,
                "../public/images/iit-dharwad-logo.png"
            ),

            cid: "iitdhlogo"

        }

    ]

    );

};

exports.sendBookingVerified = async (

    email,

    data

) => {

    const template = bookingVerified(data);

    const path = require("path");

    await sendEmail(

        email,

        template.subject,

        template.html,

        [

        {

            filename: "iit-dharwad-logo.png",

            path: path.join(
                __dirname,
                "../public/images/iit-dharwad-logo.png"
            ),

            cid: "iitdhlogo"

        }

    ]

    );

};

const bookingCancelledAuthority =
require("../templates/bookingCancelledAuthority");

exports.sendBookingCancelledToAuthority = async (

    email,

    data

) => {

    const template =
        bookingCancelledAuthority(data);

    await sendEmail(

        email,

        template.subject,

        template.html

    );

};

const bookingCancelled =
    require("../templates/bookingCancelled");

exports.sendBookingCancelled = async (email, data) => {
    const template = bookingCancelled(data);

    await sendEmail(
        email,
        template.subject,
        template.html
    );
};