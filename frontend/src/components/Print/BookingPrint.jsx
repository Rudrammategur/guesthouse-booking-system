import "./BookingPrint.css";

function BookingPrint({ application }) {

    if (!application) return null;

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });

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

                    TRANSIT BOOKING APPLICATION

                </h3>

            </div>

            {/* ========================= */}
            {/* Booking */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Booking Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td><strong>Booking Number</strong></td>

                            <td>{application.GHRBookingNo}</td>

                            <td><strong>Status</strong></td>

                            <td>{application.BookingStatus}</td>

                        </tr>

                        <tr>

                            <td><strong>Booking Date</strong></td>

                            <td>{formatDate(application.BookingDateTime)}</td>

                            <td><strong>Booked By</strong></td>

                            <td>{application.BookedBy}</td>

                        </tr>

                    </tbody>

                </table>

            </section>

            {/* ========================= */}
            {/* Guest */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Guest Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Guest Name</td>

                            <td>{application.GuestName}</td>

                            <td>Guest Type</td>

                            <td>{application.GuestTypeName}</td>

                        </tr>

                        <tr>

                            <td>Designation</td>

                            <td>{application.GuestDesignation}</td>

                            <td>Relationship</td>

                            <td>{application.GuestRelationship || "-"}</td>

                        </tr>

                        <tr>

                            <td>Nationality</td>

                            <td>{application.GuestNationality}</td>

                            <td>Contact</td>

                            <td>{application.GuestContactNo}</td>

                        </tr>

                        <tr>

                            <td>Email</td>

                            <td>{application.GuestEmailID}</td>

                            <td>Address</td>

                            <td>{application.GuestAddress}</td>

                        </tr>

                    </tbody>

                </table>

            </section>

            {/* ========================= */}
            {/* Visit */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Visit Details</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Purpose</td>

                            <td>{application.PurposeOfVisit}</td>

                            <td>Occupants</td>

                            <td>{application.OccupantsNo}</td>

                        </tr>

                        <tr>

                            <td>Arrival</td>

                            <td>{formatDate(application.ArrivalDateTime)}</td>

                            <td>Departure</td>

                            <td>{formatDate(application.DepartureDateTime)}</td>

                        </tr>

                        <tr>

                            <td>Special Request</td>

                            <td colSpan="3">

                                {application.SplRequests || "-"}

                            </td>

                        </tr>

                    </tbody>

                </table>

            </section>

            {/* ========================= */}
            {/* Accommodation */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Accommodation</h4>

                <table className="print-table">

                    <tbody>

                        <tr>

                            <td>Guest House</td>

                            <td>{application.GuestHouseName || "-"}</td>

                            <td>Rooms Requested</td>

                            <td>{application.TotalRoomsReq}</td>

                        </tr>

                    </tbody>

                </table>

            </section>

            {/* ========================= */}
            {/* Requested Rooms */}
            {/* ========================= */}

            <section className="print-section">

                <h4>Requested Room Types</h4>

                <table className="print-grid">

                    <thead>

                        <tr>

                            <th>Room Type</th>

                            <th>No. of Rooms</th>

                        </tr>

                    </thead>

                    <tbody>

                        {(application.RoomRequirements || []).map(room => (

                            <tr key={room.RoomTypeID}>

                                <td>{room.RoomTypeName}</td>

                                <td>{room.NoOfRooms}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </section>

            {/* ========================= */}
            {/* Allocated Rooms */}
            {/* ========================= */}

            {application.Allocations?.length > 0 && (

                <section className="print-section">

                    <h4>Allocated Rooms</h4>

                    <table className="print-grid">

                        <thead>

                            <tr>

                                <th>Room No</th>

                                <th>Room Type</th>

                                <th>Occupancy</th>

                            </tr>

                        </thead>

                        <tbody>

                            {application.Allocations.map(room => (

                                <tr key={room.GHRAllocationID}>

                                    <td>{room.RoomNumber}</td>

                                    <td>{room.RoomTypeName}</td>

                                    <td>

                                        {room.IsSingleOccupancy

                                            ? "Single"

                                            : "Double"}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </section>

            )}

            <div className="print-footer">

                <hr />

                <p>

                    This is a system-generated document from the
                    IIT Dharwad Guest House Management System.

                </p>

            </div>

        </div>

    );

}

export default BookingPrint;