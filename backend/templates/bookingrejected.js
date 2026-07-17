const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Booking Rejected - ${data.BookingNo}`,

    html: emailLayout({

        title: "Guest House Booking Rejected",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

We regret to inform you that your Guest House Booking Application has been rejected.

</p>

${bookingInfoTable({
    ...data,
    Status: "Rejected"
})}

<h3>Reason for Rejection</h3>

<p>

${data.Remarks || "No remarks provided."}

</p>

`

    })

});