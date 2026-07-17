const emailLayout = require("./emailLayout");

const bookingInfoTable =
    require("./bookingInfoTable");

module.exports = (data) => {

    return {

        subject: "Guest House Booking Submitted",

        html: emailLayout({

            title: "Guest House Booking Submitted Successfully",

            body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

Your Guest House Booking Application has been submitted successfully.

</p>

${bookingInfoTable({

    ...data,

    Status: "Submitted"

})}

<div class="next-step">

<strong>What happens next?</strong>

<ul>

<li>Your application has been forwarded to the Verifying Authority.</li>

<li>You will receive another email once it is verified.</li>

</ul>

</div>

`

        })

    };

};