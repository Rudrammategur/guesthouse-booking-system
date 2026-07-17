const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Guest House Booking Cancelled - ${data.BookingNo}`,

    html: emailLayout({

        title: "Guest House Booking Cancellation Notification",

        body: `

<p>

Dear <strong>${data.AuthorityName}</strong>,

</p>

<p>

This is to inform you that the following Guest House Booking has been <strong>cancelled by the applicant</strong>.

</p>

${bookingInfoTable({

    ...data,

    Status: "Cancelled"

})}

<table>

<tr>

<td class="label">

Cancelled By

</td>

<td>

${data.EmployeeName}

</td>

</tr>

<tr>

<td class="label">

Applicant ID

</td>

<td>

${data.EmployeeID || "-"}

</td>

</tr>

<tr>

<td class="label">

Authority Role

</td>

<td>

${data.AuthorityRole}

</td>

</tr>

<tr>

<td class="label">

Cancellation Date & Time

</td>

<td>

${data.CancelledOn}

</td>

</tr>

<tr>

<td class="label">

Cancellation Remarks

</td>

<td>

${data.Remarks || "No remarks provided."}

</td>

</tr>

</table>

<div class="next-step">

<strong>Action Required</strong>

<p>

No further action is required on this booking. If the booking was pending at your level, you may consider it closed. If accommodation had already been allocated, please ensure the room is released and made available for future bookings.

</p>

</div>

<p>

This is an automated notification from the <strong>IIT Dharwad Guest House Management System</strong>.

</p>

`

    })

});