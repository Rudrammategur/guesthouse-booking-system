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


function TransportAllocatorDashboard() {

    const navigate = useNavigate();

    const [applications, setApplications] =
        useState([]);

    const [counts, setCounts] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [activeFilter, setActiveFilter] =
        useState("All");


    const loadDashboard = useCallback(async () => {

        try {

            setLoading(true);

            const [
                applicationResponse,
                countResponse
            ] = await Promise.all([

                api.get(
                    "/api/transport-allocator/applications"
                ),

                api.get(
                    "/api/transport-allocator/dashboard-counts"
                )

            ]);


            console.log(
                "Transport Allocator Applications Response:",
                applicationResponse.data
            );

            console.log(
                "Transport Allocator Dashboard Counts Response:",
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
                "Transport allocator dashboard error:",
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


    /*
    =====================================================
    Dashboard Cards
    =====================================================
    */

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
            label: "Pending Allocation",

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


    /*
    =====================================================
    Application Filtering
    =====================================================
    */

    const filteredApplications =
        Array.isArray(applications)

            ? applications.filter(
                app => {

                    switch (activeFilter) {

                        /*
                        -------------------------------
                        Pending Allocation
                        -------------------------------
                        Only approved applications
                        need allocator action.
                        */

                        case "PendingApplications":

                            return (
                                app.BookingStatus ===
                                "Approved"
                            );


                        /*
                        -------------------------------
                        Processed Applications
                        -------------------------------
                        Vehicle allocated or unavailable.
                        */

                        case "ProcessedApplications":

                            return [

                                "Allocated",

                                "Vehicle Unavailable"

                            ].includes(
                                app.BookingStatus
                            );


                        /*
                        -------------------------------
                        All Applications
                        -------------------------------
                        */

                        default:

                            return [

                                "Submitted",
                                "Verified",
                                "Approved",
                                "Rejected",
                                "Allocated",
                                "Vehicle Unavailable"

                            ].includes(
                                app.BookingStatus
                            );

                    }

                }
            )

            : [];


    /*
    =====================================================
    Table Columns
    =====================================================
    */

    const columns = [

        {
            key: "TransportBookingNo",

            label: "Booking No",

            render: row =>
                row.TransportBookingNo || "-"
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


    /*
    =====================================================
    Render
    =====================================================
    */

    return (

        <ERPPage>

            <PageHeader

                hero

                logo={logo}

                title="Transport Management System"

                subtitle="Transport Office Dashboard"

                description={
                    "Manage vehicle allocation for approved transport booking applications."
                }

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
                                    `/transport-allocator/application/${row.TransportBookingID}`
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


export default TransportAllocatorDashboard;