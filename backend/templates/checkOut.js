const emailLayout = require("./emailLayout");
const bookingInfoTable = require("./bookingInfoTable");

module.exports = (data) => ({

    subject: `Checked Out - ${data.BookingNo}`,

    html: emailLayout({

        title: "Check Out Completed",

        body: `

<p>

Dear <strong>${data.EmployeeName}</strong>,

</p>

<p>

Your check-out has been completed successfully.

</p>

${bookingInfoTable({
    ...data,
    Status: "Checked Out"
})}

<p>

Thank you for staying at IIT Dharwad Guest House.

</p>

`

    })

});