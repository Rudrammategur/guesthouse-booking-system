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

import logo from "../../assets/iit-dharwad-logo.png";

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short"
          })
        : "-";

function TransportVerifierDashboard() {

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

                api.get(
                    "/api/transport-verifier/applications"
                ),

                api.get(
                    "/api/transport-verifier/dashboard-counts"
                )

            ]);

            console.log(
                "Transport Applications Response",
                applicationResponse.data
            );

            console.log(
                "Transport Dashboard Counts Response",
                countResponse.data
            );


            setApplications(
                applicationResponse.data.data || []
            );

            setCounts(
                countResponse.data.data || {}
            );

        }

        catch (err) {

            console.error(
                "Transport verifier dashboard error:",
                err
            );

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

            count:
                counts.TotalApplications ?? 0,

            color: "primary",

            active:
                activeFilter === "All",

            onClick: () =>
                setActiveFilter("All")
        },


        {
            label: "Pending Applications",

            count:
                counts.PendingApplications ?? 0,

            color: "warning",

            active:
                activeFilter ===
                "PendingApplications",

            onClick: () =>
                setActiveFilter(
                    "PendingApplications"
                )
        },


        {
            label: "Processed Applications",

            count:
                counts.AllProcessedApplications ?? 0,

            color: "info",

            active:
                activeFilter ===
                "ProcessedApplications",

            onClick: () =>
                setActiveFilter(
                    "ProcessedApplications"
                )
        }

    ];


    const filteredApplications =
        applications.filter(app => {

            switch (activeFilter) {

                case "PendingApplications":

                    return (
                        app.BookingStatus ===
                        "Submitted"
                    );


                case "ProcessedApplications":

                    return [

                        "Verified",
                        "Approved",
                        "Rejected",
                        "Allocated",
                        "Checked In",
                        "Checked Out"

                    ].includes(
                        app.BookingStatus
                    );


                default:

                    return true;

            }

        });


    const columns = [

        {
            key: "TransportBookingNo",

            label: "Booking No",

            render: row =>
                row.TransportBookingNo
        },


        {
            key: "TravellerName",

            label: "Traveller Name",

            render: row =>
                row.TravellerName || "-"
        },


        {
            key: "BookingType",

            label: "Booking Type",

            render: row =>
                row.BookingType || "-"
        },


        {
            key: "Route",

            label: "Route",

            render: row => (
                <span>
                    {row.DepartureLocation || "-"}
                    {" → "}
                    {row.ArrivalLocation || "-"}
                </span>
            )
        },


        {
            key: "DepartureDateTime",

            label: "Departure",

            render: row =>
                formatDate(
                    row.DepartureDateTime
                )
        },


        {
            key: "ArrivalDateTime",

            label: "Arrival",

            render: row =>
                formatDate(
                    row.ArrivalDateTime
                )
        },


        {
            key: "BookingStatus",

            label: "Status",

            render: row => (

                <StatusBadge
                    status={
                        row.BookingStatus
                    }
                />

            )
        }

    ];


    return (

        <ERPPage>

            <PageHeader

                hero

                logo={logo}

                title="Transport Management System"

                subtitle="Verifier Dashboard"

                description="Verify transport booking applications."

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


            <DashboardCards
                cards={cards}
            />


            <ERPSection title="Applications">

                <ERPTable

                    columns={columns}

                    data={filteredApplications}

                    loading={loading}

                    actions={(row) => (

                        <Button
                            onClick={() =>
                                navigate(
                                    `/transport-verifier/application/${row.TransportBookingID}`
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

export default TransportVerifierDashboard;