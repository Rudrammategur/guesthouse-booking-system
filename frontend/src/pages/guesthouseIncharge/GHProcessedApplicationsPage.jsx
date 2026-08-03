import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import ERPSection from "../../components/Common/ERPSection";
import ERPTable from "../../components/Common/ERPTable";
import StatusBadge from "../../components/Common/StatusBadge";
import Button from "../../components/Common/Button/Button";
import logo from "../../assets/iit-dharwad-logo.png";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short"
          })
        : "-";

function GHProcessedApplicationsPage() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadApplications = useCallback(async () => {

        setLoading(true);

        try {

            const response = await axios.get(
                `${API_URL}/api/gh-incharge/processed-applications`
            );

            setApplications(response.data.data);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to load processed applications."
            );

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadApplications();

    }, [loadApplications]);

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
            render: row => formatDate(row.ArrivalDateTime)
        },

        {
            key: "DepartureDateTime",
            label: "Departure",
            render: row => formatDate(row.DepartureDateTime)
        },

        {
            key: "TotalPayableAmount",
            label: "Amount",
            render: row =>
                `₹ ${Number(
                    row.TotalPayableAmount || 0
                ).toLocaleString("en-IN")}`
        },

        {
            key: "BookingStatus",
            label: "Status",
            render: row => (
                <StatusBadge status={row.BookingStatus} />
            )
        }

    ];

    return (

        <ERPPage>

            <PageHeader
                hero
                logo={logo}
                title="Guest House Management System"
                subtitle="Processed Applications"
                description="View completed guest house bookings and booking history."
            />

            <ERPSection
                title="Processed Applications"
                subtitle="Completed bookings"
            >

                <ERPTable
                    columns={columns}
                    data={applications}
                    loading={loading}
                    actions={(row) => (
                        <>
                            <Button
                                className="view-btn"
                                onClick={() =>
                                    navigate(
                                        `/ghincharge/application/${row.GHBookingID}`
                                    )
                                }
                            >
                                View
                            </Button>
                        </>
                    )}
                />

            </ERPSection>

        </ERPPage>

    );

}

export default GHProcessedApplicationsPage;