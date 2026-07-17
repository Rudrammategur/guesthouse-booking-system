const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Booking Approved - ${data.BookingNo}`,

    html: emailLayout({

        title: "Guest House Booking Approved",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

Congratulations!

</p>

<p>

Your Guest House Booking Application has been approved.

</p>

${bookingInfoTable({
    ...data,
    Status: "Approved"
})}

<div class="next-step">

<strong>Next Step</strong>

<ul>

<li>Room allocation will be done by the Guest House Incharge.</li>

<li>You will receive room allocation details shortly.</li>

</ul>

</div>

`

    })

});