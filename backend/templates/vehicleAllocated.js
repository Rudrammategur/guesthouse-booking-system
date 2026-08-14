module.exports = (data) => {

    return {

        subject:
            `Transport Vehicle Allocation - ${data.TransportBookingNo}`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
            ">

                <h2>
                    Transport Vehicle Allocation
                </h2>

                <p>
                    Dear ${data.TravellerName || "Traveller"},
                </p>

                <p>
                    Your transport vehicle has been
                    allocated successfully.
                </p>

                <table
                    style="
                        border-collapse: collapse;
                        width: 100%;
                        max-width: 650px;
                    "
                >

                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            Booking No
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            ${data.TransportBookingNo || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            Traveller
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            ${data.TravellerName || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            From
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            ${data.DepartureLocation || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            To
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            ${data.ArrivalLocation || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            Departure
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            ${data.DepartureDateTime || "-"}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            Vehicle
                        </td>

                        <td style="
                            padding: 8px;
                            border: 1px solid #ddd;
                        ">
                            <strong>
                                ${data.VehicleNumber || "-"}
                            </strong>
                        </td>

                    </tr>

                </table>


                ${
                    data.Remarks
                        ? `
                            <p>
                                <strong>Remarks:</strong>
                                ${data.Remarks}
                            </p>
                        `
                        : ""
                }


                <p>
                    Regards,<br />
                    IIT Dharwad Transport Office
                </p>

            </div>
        `

    };

};