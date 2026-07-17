const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Checked In - ${data.BookingNo}`,

    html: emailLayout({

        title: "Guest Successfully Checked In",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

You have successfully checked in to the IIT Dharwad Guest House.

</p>

${bookingInfoTable({
    ...data,
    Status: "Checked In"
})}

<p>

We wish you a pleasant stay.

</p>

`

    })

});