import { useNavigate } from "react-router-dom";
import "../Dashboard/dashboard.css";
import "../table.css";

function DashboardTable({
    applications = [],
    viewRoute,
    onPrint,
}) {
    const navigate = useNavigate();

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString();
    };

    if (applications.length === 0) {
        return (
            <div className="dashboard-empty">
                <h3>No Applications Found</h3>
                <p>No guest house bookings are available.</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="erp-table">
                <thead>
                    <tr>
                        <th scope="col">Booking No.</th>
                        <th scope="col">Guest Name</th>
                        <th scope="col">Guest Type</th>
                        <th scope="col">Rooms</th>
                        <th scope="col">Employee</th>
                        <th scope="col">Arrival</th>
                        <th scope="col">Departure</th>
                        <th scope="col">Submission</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="action-column">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {applications.map((item) => (
                        <tr key={item.GHBookingID}>
                            <td>{item.GHRBookingNo}</td>
                            <td>{item.GuestName}</td>
                            <td>{item.GuestTypeName}</td>
                            <td>{item.TotalRoomsReq}</td>
                            <td>{item.BookedBy}</td>
                            <td>{formatDate(item.ArrivalDateTime)}</td>
                            <td>{formatDate(item.DepartureDateTime)}</td>
                            <td>{formatDate(item.BookingDateTime)}</td>
                            <td>
                                <span className="status-badge">
                                    {item.BookingStatus}
                                </span>
                            </td>

                            <td>
                                <div className="table-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() =>
                                            navigate(`${viewRoute}/${item.GHBookingID}`)
                                        }
                                    >
                                        View
                                    </button>

                                    {item.BookingStatus === "Pending" && (
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancel(item.GHBookingID)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default DashboardTable;