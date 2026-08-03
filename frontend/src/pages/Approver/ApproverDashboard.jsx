import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import ERPSection from "../../components/Common/ERPSection";
import ERPTable from "../../components/Common/ERPTable";
import DashboardCards from "../../components/Dashboard/DashboardCards";
import StatusBadge from "../../components/Common/StatusBadge";
import Button from "../../components/Common/Button/Button";

import logo from "../../assets/iit-dharwad-logo.png";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

const formatDate = value =>
    value
        ? new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        })
        : "-";

function ApproverDashboard() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [counts, setCounts] = useState({});

    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState("All");

    const loadDashboard = useCallback(async () => {

        try {

            setLoading(true);

            const [

                applicationResponse,

                countResponse

            ] = await Promise.all([

                axios.get(
                    `${API_URL}/api/approver/applications`
                ),

                axios.get(
                    `${API_URL}/api/approver/dashboard-counts`
                )

            ]);

            setApplications(applicationResponse.data.data);

            setCounts(countResponse.data.data);

        }

        catch (err) {

            console.error(err);

        }

        finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadDashboard();

    }, [loadDashboard]);

    const cards = [

        {
            label: "All Applications",
            count: counts.TotalApplications ?? 0,
            color: "primary",
            active: activeFilter === "All",
            onClick: () => setActiveFilter("All")
        },

        {
            label: "Pending Applications",
            count: counts.PendingApplications ?? 0,
            color: "warning",
            active: activeFilter === "PendingApplications",
            onClick: () =>
                setActiveFilter("PendingApplications")
        },

        {
            label: "Approved Applications",
            count: counts.ApprovedApplications ?? 0,
            color: "success",
            active: activeFilter === "ApprovedApplications",
            onClick: () =>
                setActiveFilter("ApprovedApplications")
        },

        {
            label: "Rejected Applications",
            count: counts.RejectedApplications ?? 0,
            color: "danger",
            active: activeFilter === "RejectedApplications",
            onClick: () =>
                setActiveFilter("RejectedApplications")
        },

        {
            label: "Processed Applications",
            count: counts.AllProcessedApplications ?? 0,
            color: "info",
            active: activeFilter === "ProcessedApplications",
            onClick: () =>
                setActiveFilter("ProcessedApplications")
        }

    ];

    const filteredApplications =
        applications.filter(app => {

            switch (activeFilter) {

                case "PendingApplications":

                    return app.BookingStatus === "Verified";

                case "ApprovedApplications":

                    return app.BookingStatus === "Approved";

                case "RejectedApplications":

                    return app.BookingStatus === "Rejected";

                case "ProcessedApplications":

                    return [
                        "Approved",
                        "Rejected"
                    ].includes(app.BookingStatus);

                default:

                    return true;

            }

        });

    const columns = [

        {
            key: "BookingNo",
            label: "Booking No",
            render: row => row.GHRBookingNo
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
            key: "TotalRoomsReq",
            label: "Rooms"
        },

        {
            key: "ArrivalDateTime",
            label: "Arrival",
            render: row =>
                formatDate(row.ArrivalDateTime)
        },

        {
            key: "DepartureDateTime",
            label: "Departure",
            render: row =>
                formatDate(row.DepartureDateTime)
        },

        {
            key: "BookingStatus",
            label: "Status",
            render: row =>
                <StatusBadge
                    status={row.BookingStatus}
                />
        }

    ];

    return (

        <ERPPage>

            <PageHeader

                hero

                logo={logo}

                title="Guest House Management System"

                subtitle="Approver Dashboard"

                description="Review and approve verified guest house booking applications."

            />

            <DashboardCards cards={cards} />

            <ERPSection title="Applications">

                <ERPTable

                    columns={columns}

                    data={filteredApplications}

                    loading={loading}

                    actions={(row) => (

                        <Button
                            onClick={() =>
                                navigate(
                                    `/approver/application/${row.GHBookingID}`
                                )
                            }
                        >
                            View
                        </Button>

                    )}

                />

            </ERPSection>

        </ERPPage>

    );

}

export default ApproverDashboard;