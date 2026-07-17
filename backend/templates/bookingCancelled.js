const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Booking Cancelled - ${data.BookingNo}`,

    html: emailLayout({

        title: "Guest House Booking Cancelled",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

Your request to cancel the Guest House Booking has been processed successfully.

</p>

${bookingInfoTable({

    ...data,

    Status: "Cancelled"

})}

<h3>Cancellation Details</h3>

<table>

<tr>

<td class="label">

Cancelled By

</td>

<td>

Applicant

</td>

</tr>

<tr>

<td class="label">

Cancellation Date & Time

</td>

<td>

${data.CancelledOn || "-"}

</td>

</tr>

<tr>

<td class="label">

Reason

</td>

<td>

${data.Remarks || "Not Provided"}

</td>

</tr>

</table>

<div class="next-step">

<strong>Note</strong>

<p>

This booking has been cancelled at your request. If accommodation is required in the future, please submit a new Guest House Booking application through the Guest House Management System.

</p>

</div>

`

    })

});