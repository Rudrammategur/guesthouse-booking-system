
const path = require("path");

const { sendEmail } =
    require("./emailService");

const bookingSubmitted =
    require("../templates/bookingSubmitted");

const bookingVerified =
    require("../templates/bookingVerified");

const bookingCancelledAuthority =
    require("../templates/bookingCancelledAuthority");

const bookingCancelled =
    require("../templates/bookingCancelled");

const vehicleAllocated =
    require("../templates/vehicleAllocated");

const roomAllocated =
    require("../templates/roomAllocated");


const logoAttachment = {

    filename:
        "iit-dharwad-logo.png",

    path:
        path.join(
            __dirname,
            "../public/images/iit-dharwad-logo.png"
        ),

    cid:
        "iitdhlogo"

};


/*
=========================================================
BOOKING SUBMITTED
=========================================================
*/

exports.sendBookingSubmitted = async (
    email,
    data
) => {

    const template =
        bookingSubmitted(data);

    await sendEmail(
        email,
        template.subject,
        template.html,
        [logoAttachment]
    );

};


/*
=========================================================
BOOKING VERIFIED
=========================================================
*/

exports.sendBookingVerified = async (
    email,
    data
) => {

    const template =
        bookingVerified(data);

    await sendEmail(
        email,
        template.subject,
        template.html,
        [logoAttachment]
    );

};


/*
=========================================================
BOOKING CANCELLED TO AUTHORITY
=========================================================
*/

exports.sendBookingCancelledToAuthority =
    async (
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


/*
=========================================================
BOOKING CANCELLED TO APPLICANT
=========================================================
*/

exports.sendBookingCancelled =
    async (
        email,
        data
    ) => {

        const template =
            bookingCancelled(data);

        await sendEmail(
            email,
            template.subject,
            template.html
        );

    };


/*
=========================================================
TRANSPORT VEHICLE ALLOCATED
=========================================================
TO  -> Traveller
CC  -> Applicant/Employee
=========================================================
*/

exports.sendTransportVehicleAllocated =
    async (
        travellerEmail,
        employeeEmail,
        data
    ) => {

        const template =
            vehicleAllocated(data);

        await sendEmail(

            travellerEmail,

            template.subject,

            template.html,

            [logoAttachment],

            employeeEmail
                ? [employeeEmail]
                : []

        );

    };


/*
=========================================================
GUEST HOUSE ROOM ALLOCATED
=========================================================
TO  -> Guest
CC  -> Applicant/Employee
=========================================================
*/

exports.sendRoomAllocated =
    async (
        guestEmail,
        employeeEmail,
        data
    ) => {

        const template =
            roomAllocated(data);

        await sendEmail(

            guestEmail,

            template.subject,

            template.html,

            [logoAttachment],

            employeeEmail
                ? [employeeEmail]
                : []

        );

    };
