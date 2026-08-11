import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import ERPSection from "../../components/Common/ERPSection";
import ERPTable from "../../components/Common/ERPTable";
import DashboardCards from "../../components/Dashboard/DashboardCards";
import StatusBadge from "../../components/Common/StatusBadge";
import Button from "../../components/Common/Button/Button";
import { getUserHeader } from "../../utils/userHeader";

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

function VerifierDashboard() {

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

                api.get("/api/verifier/applications"),

                api.get("/api/verifier/dashboard-counts")
            ]);

            console.log("Applications Response", applicationResponse.data);
            console.log("Dashboard Counts Response", countResponse.data);

            setApplications(applicationResponse.data.data || []);
            setCounts(countResponse.data.data || {});

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

                    return app.BookingStatus === "Submitted";

                case "ProcessedApplications":

                    return [
                        'Verified',
                        "Approved",
                        "Rejected",
                        "Allocated",
                        "Checked In",
                        "Checked Out",
                        "cancelled"
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

            key: "GuestHouseName",

            label: "Guest House"

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

                subtitle="Verifier Dashboard"

                description="Verify guest house booking applications."

                actions={
                    <div className="hero-actions">
                        <Button
                            variant="outline"
                            onClick={() => {
                                window.location.href =
                                    `${window.location.origin}/Default/Pages/Portal/PortalInfrastructure.html`;
                            }}
                        >
                            ← Back
                        </Button>
                    </div>
                }

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
                                    `/verifier/application/${row.GHBookingID}`
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

export default VerifierDashboard;