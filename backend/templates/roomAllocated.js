const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Room Allocated - ${data.BookingNo}`,

    html: emailLayout({

        title: "Room Allocation Completed",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

A room has been allocated for your stay.

</p>

${bookingInfoTable({
    ...data,
    Status: "Allocated"
})}

<div class="next-step">

<strong>Please Note</strong>

<ul>

<li>Please carry your Institute ID.</li>

<li>Report to the Guest House Reception during check-in.</li>

</ul>

</div>

`

    })

});