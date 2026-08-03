import { useNavigate } from "react-router-dom";
import DashboardCards from "../../components/Dashboard/DashboardCards";
import { useEffect, useState } from "react";
import axios from "axios";

import QuickActions from "../../components/Admin/QuickActions";
import TodayGuests from "../../components/Admin/TodayGuests";
import ActivityTimeline from "../../components/Admin/ActivityTimeline";

import "../../styles/adminDashboard.css";

function AdminDashboard() {

    const navigate = useNavigate();


    const API_URL =
        import.meta.env.VITE_API_URL ||
        "/guesthouse-api";

    const [dashboard, setDashboard] = useState({

        counts: {
            totalApplications: 0,
            checkedIn: 0,
            checkedOut: 0,
            occupancy: 0
        },

        operations: {
            todayArrivals: 0,
            todayDepartures: 0,
            occupiedRooms: 0,
            vacantRooms: 0
        },

        arrivals: [],

        departures: [],

        activities: []

    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDashboard();

    }, []);

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const response = await axios.get(

                `${API_URL}/api/admin/dashboard`

            );

            setDashboard(

                response.data

            );

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    const cards = [

        {

            label: "Applications",

            count: dashboard?.counts?.totalApplications ?? 0,

            className: "total-card"

        },

        {

            label: "Checked In",

            count: dashboard?.counts?.checkedIn ?? 0,

            className: "verified-card"

        },

        {

            label: "Checked Out",

            count: dashboard?.counts?.checkedOut ?? 0

        },

        {

            label: "Occupancy",

            count: `${dashboard?.counts?.occupancy ?? 0}%`,

            className: "allocated-card"

        }

    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }

    return (

        <div className="admin-dashboard">

            <div className="dashboard-content">

                <DashboardCards cards={cards} />

                <div className="dashboard-grid">

                    <QuickActions />

                    <TodayGuests

                        arrivals={dashboard.arrivals}

                        departures={dashboard.departures}

                    />

                </div>

                <ActivityTimeline
                    activities={dashboard.activities}
                />

            </div>

        </div>
    );

}

export default AdminDashboard;