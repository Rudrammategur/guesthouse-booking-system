import "./BookingPrint.css";

function TransportBookingPrint({ application }) {

    if (!application)
        return null;

    const formatDate = (date) => {

        if (!date)
            return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };

    return (

        <div className="booking-print">

            {/* ========================= */}
            {/* Institute Header */}
            {/* ========================= */}

            <div className="print-header">

                <h2>
                    INDIAN INSTITUTE OF TECHNOLOGY DHARWAD
                </h2>

                <h3>
                    TRANSPORT BOOKING APPLICATION
                </h3>

            </div>


            {/* ========================= */}
            {/* Booking Details */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Booking Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>
                                <strong>Booking Number</strong>
                            </td>

                            <td>
                                {application.TransportBookingNo || "-"}
                            </td>

                            <td>
                                <strong>Status</strong>
                            </td>

                            <td>
                                {application.BookingStatus || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>
                                <strong>Booking Date</strong>
                            </td>

                            <td>
                                {formatDate(
                                    application.BookingDateTime
                                )}
                            </td>

                            <td>
                                <strong>Booked By</strong>
                            </td>

                            <td>
                                {application.BookedBy || "-"}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Traveller Details */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Traveller Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Traveller Name</td>

                            <td>
                                {application.TravellerName || "-"}
                            </td>

                            <td>Number of Travellers</td>

                            <td>
                                {application.NumberOfTravellers || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>Contact Number</td>

                            <td>
                                {application.TravellerContactNo || "-"}
                            </td>

                            <td>Email</td>

                            <td>
                                {application.TravellerEmailID || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>Address</td>

                            <td colSpan="3">
                                {application.TravellerAddress || "-"}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Journey Details */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Journey Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Booking Type</td>

                            <td>
                                {application.BookingType || "-"}
                            </td>

                            <td>Seating Capacity</td>

                            <td>
                                {application.SeatingCapacity || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>Departure Location</td>

                            <td>
                                {application.DepartureLocation || "-"}
                            </td>

                            <td>Arrival Location</td>

                            <td>
                                {application.ArrivalLocation || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>Departure</td>

                            <td>
                                {formatDate(
                                    application.DepartureDateTime
                                )}
                            </td>

                            <td>Arrival</td>

                            <td>
                                {formatDate(
                                    application.ArrivalDateTime
                                )}
                            </td>

                        </tr>

                        <tr>

                            <td>Purpose of Travel</td>

                            <td colSpan="3">
                                {application.PurposeOfTravel || "-"}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Financial Details */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Financial Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Expenditure Head</td>

                            <td>
                                {application.ExpenditureHead || "-"}
                            </td>

                            <td>Project Number</td>

                            <td>
                                {application.ProjectNo || "-"}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Additional Information */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Additional Information</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td colSpan="4">
                                {application.AdditionalInfo ||
                                    "No additional information."}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Assignment Details */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Workflow Assignment</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Assigned Verifier</td>

                            <td>
                                {application.AssignedVerifierID || "-"}
                            </td>

                            <td>Assigned Approver</td>

                            <td>
                                {application.AssignedApproverID || "-"}
                            </td>

                        </tr>

                        <tr>

                            <td>Transport Office</td>

                            <td colSpan="3">
                                {application.AssignedTransportOfficeID || "-"}
                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>


            {/* ========================= */}
            {/* Footer */}
            {/* ========================= */}

            <div className="print-footer">

                <hr />

                <p>
                    This is a system-generated document from the
                    IIT Dharwad Transport Management System.
                </p>

            </div>

        </div>

    );

}

export default TransportBookingPrint;