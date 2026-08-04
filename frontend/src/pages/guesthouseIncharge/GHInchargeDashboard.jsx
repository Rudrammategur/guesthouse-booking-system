import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardCards from "../../components/Dashboard/DashboardCards";
import "../../components/Dashboard/dashboard.css";
import "../../styles/ghIncharge.css";
import RoomAvailabilityCalendar from "../../components/Common/RoomAvailabilityCalendar";
import Button from "../../components/Common/Button/Button";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import ERPSection from "../../components/Common/ERPSection";
import ERPTable from "../../components/Common/ERPTable";
import StatusBadge from "../../components/Common/StatusBadge";
import logo from "../../assets/iit-dharwad-logo.png";
import GHInchargeSidebar from "./GHInchargeSidebar";

const API_URL = import.meta.env.VITE_API_URL || "/guesthouse-api";

const formatDate = (value) => value
  ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  : "-";

function GHInchargeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [occupancy, setOccupancy] = useState({});
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [collapsed, setCollapsed] = useState(false);


  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const actionRequired =
        activeTab === "allocation" ||
        activeTab === "checkin" ||
        activeTab === "checkout";
      const [
        applicationsResponse,
        countsResponse,
        occupancyResponse,
        roomAvailabilityResponse
      ] = await Promise.all([

        axios.get(`${API_URL}/api/gh-incharge/applications`, {
          params: { actionRequired }
        }),

        axios.get(`${API_URL}/api/gh-incharge/dashboard-counts`),

        axios.get(`${API_URL}/api/gh-incharge/occupancy-summary`),

        axios.get(`${API_URL}/api/gh-incharge/room-availability`)

      ]);
      setApplications(applicationsResponse.data.data);
      setCounts(countsResponse.data.data);
      setOccupancy(occupancyResponse.data.data);
      setRoomAvailability(roomAvailabilityResponse.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load applications");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const filteredApplications = applications.filter(app => {

    if (activeFilter === "PendingForRoomAllocation")
      return app.BookingStatus === "Approved";

    if (activeFilter === "PendingForCheckIn")
      return app.BookingStatus === "Allocated";

    if (activeFilter === "PendingForCheckOut")
      return app.BookingStatus === "Checked In";


    return true;

  });

  const displayedApplications = filteredApplications.filter(app => {

    switch (activeTab) {

      case "allocation":
        return app.BookingStatus === "Approved";

      case "checkin":
        return app.BookingStatus === "Allocated";

      case "checkout":
        return app.BookingStatus === "Checked In";

      default:
        return true;

    }

  });

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const cards = [

    {
      label: "All Applications",
      count: counts.TotalApplications ?? applications.length,
      className: "total-card",
      active: activeFilter === "All",
      onClick: () => setActiveFilter("All")
    },

    {
      label: "Pending For Room Allocation",
      count: counts.PendingForRoomAllocation ?? 0,
      active: activeFilter === "PendingForRoomAllocation",
      onClick: () => setActiveFilter("PendingForRoomAllocation")
    },

    {
      label: "Rooms Allocated",
      count: counts.PendingForCheckIn ?? 0,
      className: "allocated-card",
      active: activeFilter === "PendingForCheckIn",
      onClick: () => setActiveFilter("PendingForCheckIn")
    },

    {
      label: "Checked In",
      count: counts.PendingForCheckOut ?? 0,
      className: "checkedin-card",
      active: activeFilter === "PendingForCheckOut",
      onClick: () => setActiveFilter("PendingForCheckOut")
    }

  ];

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
      render: row => formatDate(row.ArrivalDateTime)
    },

    {
      key: "DepartureDateTime",
      label: "Departure",
      render: row => formatDate(row.DepartureDateTime)
    },

    {
      key: "BookingStatus",
      label: "Status",
      render: row => (
        <StatusBadge status={row.BookingStatus} />
      )
    }

  ];

  const getActionButton = (application) => {

    if (application.BookingStatus === "Approved") {

      return (
        <Button
          onClick={() =>
            navigate(`/guesthouse/allocation/${application.GHBookingID}`)
          }
        >
          Allocate Room
        </Button>
      );

    }

    if (application.BookingStatus === "Allocated") {

      return (
        <Button
          className="checkin-btn"
          onClick={() =>
            navigate(`/gh-incharge/checkin/${application.GHBookingID}`)
          }
        >
          Check In
        </Button>
      );

    }

    if (application.BookingStatus === "Checked In") {

      return (
        <button
          type="button"
          className="checkout-btn"
          onClick={() =>
            navigate(
              `/gh-incharge/checkout/${application.GHBookingID}`
            )
          }
        >
          Check Out
        </button>
      );

    }

    if (application.BookingStatus === "CheckedOut") {

      return (
        <button
          type="button"
          className="receipt-btn"
          onClick={() =>
            navigate(
              `/gh-incharge/receipt/${application.GHBookingID}`
            )
          }
        >
          Receipt
        </button>


      );

    }

    return (
      <Button type="button"
        className="view-btn"

        onClick={() =>

          navigate(

            `/ghincharge/application/${application.GHBookingID}`

          )

        }

      >

        View

      </Button>
    );

  };

  return (
    <ERPPage>

      <PageHeader
        hero
        logo={logo}
        title="Guest House Management System"
        subtitle="Guest House Incharge Dashboard"
        description="Manage room allocation, check-in and check-out."
        actions={
        <div className="hero-actions">
            <Button
                variant="outline"
                onClick={() => navigate(-1)}
            >
                ← Back
            </Button>
        </div>
    }
      />
      <div className="gh-layout">

        <GHInchargeSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="gh-content">

          <DashboardCards cards={cards} />

          <ERPSection
            title="Applications"
            subtitle="Allocate rooms, perform check-in/check-out and monitor room availability."
          >
            <div
              className="dashboard-tabs"
              role="tablist"
            >

              <button
                type="button"
                className={
                  activeTab === "all"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("all")
                }
              >
                All
              </button>

              <button
                type="button"
                className={
                  activeTab === "allocation"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("allocation")
                }
              >
                Allocation Queue
              </button>

              <button
                type="button"
                className={
                  activeTab === "checkin"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("checkin")
                }
              >
                Check-In Queue
              </button>

              <button
                type="button"
                className={
                  activeTab === "checkout"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab("checkout")
                }
              >
                Check-Out Queue
              </button>

              <button
                type="button"
                className={activeTab === "availability" ? "active" : ""}
                onClick={() => setActiveTab("availability")}
              >
                Room Availability
              </button>

            </div>
            <div className="table-scroll">

              {activeTab !== "availability" ? (

                <ERPTable
                  columns={columns}
                  data={displayedApplications}
                  loading={loading}
                  actions={(row) => getActionButton(row)}
                />

              ) : (

                <div className="calendar-modal-body">
                  <RoomAvailabilityCalendar
                    rooms={roomAvailability}
                    occupancy={occupancy}
                    title="Guest House Room Availability"
                    numberOfDays={15}
                  />
                </div>

              )}

            </div>
          </ERPSection>

        </div>

      </div>



    </ERPPage>
  );
}

export default GHInchargeDashboard;
