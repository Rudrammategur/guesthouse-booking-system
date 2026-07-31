import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/Common/PageHeader";
import InfoCard from "../../components/Common/InfoCard/InfoCard";
import ERPTable from "../../components/Common/ERPTable";
import Button from "../../components/Common/Button/Button";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:9009";

function GHProcessedApplicationsPage() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadApplications();

    }, []);

    const loadApplications = async () => {

        try {

            const res = await axios.get(

                `${API_URL}/api/gh-incharge/processed-applications`

            );

            setApplications(res.data.data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    };

    const columns = [

        {
            key: "GHRBookingNo",
            label: "Booking No"
        },

        {
            key: "GuestName",
            label: "Guest Name"
        },

        {
            key: "GuestTypeName",
            label: "Guest Type"
        },

        {
            key: "GuestHouseName",
            label: "Guest House"
        },

        {
            key: "ArrivalDateTime",
            label: "Arrival",
            render: (row) =>
                new Date(row.ArrivalDateTime).toLocaleDateString("en-IN")
        },

        {
            key: "DepartureDateTime",
            label: "Departure",
            render: (row) =>
                new Date(row.DepartureDateTime).toLocaleDateString("en-IN")
        },

        {
            key: "TotalPayableAmount",
            label: "Amount",
            render: (row) =>
                `₹ ${Number(row.TotalPayableAmount || 0).toLocaleString("en-IN")}`
        },

        {
            key: "BookingStatus",
            label: "Status"
        }

    ];

    return (

        <div className="dashboard-page">

            <PageHeader

                title="Processed Applications"

                subtitle="Completed Guest House Bookings"

            />

            <InfoCard>

                <ERPTable
                    columns={columns}
                    data={applications}
                    loading={loading}
                    actions={(row) => (
                        <>
                            <Button
                                size="sm"
                                onClick={() =>
                                    navigate(`/ghincharge/application/${row.GHBookingID}`)
                                }
                            >
                                View
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    navigate(`/gh-incharge/receipt/${row.GHBookingID}`)
                                }
                            >
                                Receipt
                            </Button>
                        </>
                    )}
                />

            </InfoCard>

        </div>

    );

}

export default GHProcessedApplicationsPage;