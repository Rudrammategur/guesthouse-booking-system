import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { toast } from "react-toastify";
import transportApi from "../../api/transportApi.js";

import ERPPage from "../../components/Common/ERPPage";
import ERPTable from "../../components/Common/ERPTable";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button.jsx";
import ERPSection from "../../components/Common/ERPSection";
import DashboardCards from "../../components/Dashboard/DashboardCards";
import StatusBadge from "../../components/Common/StatusBadge";
import ERPConfirmDialog from "../../components/Common/ERPConfirmDialog";
import BookingActions from "../../components/Guesthouse/BookingActions.jsx";

import logo from "../../assets/iit-dharwad-logo.png";
import { getUserHeader } from "../../utils/userHeader";


const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    })
    : "-";


function TransportDashboard() {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);

  const [counts, setCounts] = useState({});

  const [loading, setLoading] = useState(true);

  const [showCancelDialog, setShowCancelDialog] =
    useState(false);

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("all");

  const [employeeName, setEmployeeName] =
    useState("");

  const [userInfo, setUserInfo] =
    useState(null);


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = useCallback(async () => {

    if (!userInfo) return;

    setLoading(true);

    try {

      const userHeader = getUserHeader();


      const [
        applicationResponse,
        countResponse
      ] = await Promise.all([

        transportApi.get(
          "/api/transport/my-applications",
          {
            headers: getUserHeader()
          }
        ),

        transportApi.get(
          "/api/transport/dashboard-counts",
          {
            headers: getUserHeader()
          }
        )

      ]);


      setApplications(
        applicationResponse.data.data || []
      );


      setCounts(
        countResponse.data.data || {}
      );


    } catch (err) {

      console.error(
        "Transport dashboard error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
        "Unable to load transport dashboard"
      );

    } finally {

      setLoading(false);

    }

  }, [userInfo]);


  // =====================================================
  // GET CURRENT USER
  // =====================================================

  // useEffect(() => {

  //   let el = null;

  //   try {

  //     el =
  //       window.top.document.querySelector(
  //         "#spnUserName"
  //       );

  //   } catch (e) {

  //     console.error(
  //       "Unable to access ERP username",
  //       e
  //     );

  //   }


  //   if (!el?.innerText) {

  //     toast.error(
  //       "Unable to determine logged in user."
  //     );

  //     return;

  //   }


  //   const name =
  //     el.innerText.trim();


  //   setEmployeeName(name);


  //   api.get(
  //     "/api/user/me",
  //     {
  //       params: {
  //         name
  //       }
  //     }
  //   )
  //     .then((res) => {

  //       setUserInfo(
  //         res.data
  //       );


  //       localStorage.setItem(
  //         "currentUser",
  //         JSON.stringify(res.data)
  //       );

  //     })
  //     .catch((err) => {

  //       console.error(
  //         err
  //       );

  //       toast.error(
  //         "Unable to fetch employee details."
  //       );

  //     });

  // }, []);


  useEffect(() => {

    const loadUser = async () => {

      try {

        let employeeName = null;

        try {

          const el =
            window.top.document.querySelector(
              "#spnUserName"
            );

          if (el?.innerText?.trim()) {

            employeeName =
              el.innerText.trim();

          }

        }
        catch (error) {

          console.error(
            "Unable to access ERP username:",
            error
          );

        }


        if (!employeeName) {

          toast.error(
            "Unable to determine logged in user."
          );

          return;

        }


        setEmployeeName(
          employeeName
        );


        const response =
          await api.get(
            "/api/user/me",
            {
              params: {
                name: employeeName
              }
            }
          );


        const currentUser =
          response.data.data;


        if (!currentUser) {

          throw new Error(
            "User information was not returned."
          );

        }


        setUserInfo(
          currentUser
        );


        /*
         * Make the resolved ERP user available
         * to all Axios interceptors.
         */

        window.currentUser =
          currentUser;


        localStorage.setItem(
          "currentUser",
          JSON.stringify(
            currentUser
          )
        );

      }
      catch (error) {

        console.error(
          "Unable to fetch employee details:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Unable to fetch employee details."
        );

      }

    };


    loadUser();

  }, []);


  // =====================================================
  // LOAD DASHBOARD AFTER USER INFO
  // =====================================================

  useEffect(() => {

    if (userInfo) {

      loadDashboard();

    }

  }, [
    userInfo,
    loadDashboard
  ]);


  // =====================================================
  // CANCEL TRANSPORT BOOKING
  // =====================================================

  const cancelBooking = async () => {

    try {

      setCancelLoading(true);


      await api.put(

        `/api/transport/${selectedBooking}/cancel`

      );


      toast.success(
        "Transport request cancelled successfully."
      );


      setShowCancelDialog(false);

      setSelectedBooking(null);


      loadDashboard();


    } catch (err) {

      console.error(
        "Cancel transport booking error:",
        err
      );


      toast.error(

        err.response?.data?.message ||

        "Unable to cancel transport request."

      );

    } finally {

      setCancelLoading(false);

    }

  };


  // =====================================================
  // DASHBOARD CARDS
  // =====================================================

  const cards = [

    {
      label: "Total",
      count:
        counts.TotalApplications ??
        counts.TotalBookings ??
        counts.Total ??
        0,
      color: "primary"
    },

    {
      label: "Submitted",
      count:
        counts.Submitted ??
        0,
      color: "warning"
    },

    {
      label: "Approved",
      count:
        counts.Approved ??
        0,
      color: "success"
    },

    {
      label: "Rejected",
      count:
        counts.Rejected ??
        0,
      color: "danger"
    },

    {
      label: "Completed",
      count:
        counts.Completed ??
        0,
      color: "info"
    },

    {
      label: "Cancelled",
      count:
        counts.Cancelled ??
        0,
      color: "secondary"
    }

  ];


  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [

    {
      key: "TransportBookingNo",

      label: "Booking No",

      render: (row) => (

        row.TransportBookingNo ||

        row.BookingNo ||

        row.TransportBookingID ||

        "-"

      )

    },


    {
      key: "TravellerName",

      label: "Traveller Name",

      render: (row) => (

        row.TravellerName ||
        "-"

      )

    },


    {
      key: "DepartureLocation",

      label: "Departure",

      render: (row) => (

        row.DepartureLocation ||
        "-"

      )

    },


    {
      key: "ArrivalLocation",

      label: "Arrival",

      render: (row) => (

        row.ArrivalLocation ||
        "-"

      )

    },


    {
      key: "DepartureDateTime",

      label: "Departure",

      render: (row) => (

        formatDate(
          row.DepartureDateTime
        )

      )

    },


    {
      key: "ArrivalDateTime",

      label: "Arrival",

      render: (row) => (

        formatDate(
          row.ArrivalDateTime
        )

      )

    },


    {
      key: "BookingStatus",

      label: "Status",

      render: (row) => (

        <StatusBadge
          status={
            row.BookingStatus
          }
        />

      )

    }

  ];


  // =====================================================
  // FILTER APPLICATIONS
  // =====================================================

  const filteredApplications =

    Array.isArray(applications)

      ? applications.filter(
        (app) => {

          if (
            activeTab ===
            "pending"
          ) {

            return [

              "Submitted",

              "Verified",

              "Approved",

              "Allocated"

            ].includes(
              app.BookingStatus
            );

          }


          if (
            activeTab ===
            "approved"
          ) {

            return (
              app.BookingStatus ===
              "Approved"
            );

          }


          if (
            activeTab ===
            "rejected"
          ) {

            return (
              app.BookingStatus ===
              "Rejected"
            );

          }


          if (
            activeTab ===
            "completed"
          ) {

            return [

              "Completed",

              "Cancelled"

            ].includes(
              app.BookingStatus
            );

          }


          return true;

        }
      )

      : [];


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <ERPPage>

      <PageHeader

        hero

        logo={logo}

        title="Transport Management System"

        subtitle="Institute Transport Facility"

        description={
          "Submit transport requests for official institute travel, track applications and manage your requests."
        }

        actions={

          <>

            <Button
              onClick={() =>
                navigate(
                  "/transport/apply"
                )
              }
            >
              + Apply for Transport
            </Button>


            <Button

              variant="outline"

              onClick={() => {

                window.location.href =
                  `${window.location.origin}/Default/Pages/Portal/PortalInfrastructure.html`;

              }}

            >
              ← Back
            </Button>

          </>

        }

      />


      {/* =================================================
                DASHBOARD CARDS
            ================================================= */}

      <DashboardCards
        cards={cards}
      />


      {/* =================================================
                MY APPLICATIONS
            ================================================= */}

      <ERPSection
        title="My Transport Requests"
      >


        <div
          className="dashboard-tabs"
          role="tablist"
        >


          <button

            className={
              activeTab === "all"
                ? "active"
                : ""
            }

            onClick={() =>
              setActiveTab(
                "all"
              )
            }

          >
            All
          </button>


          <button

            className={
              activeTab ===
                "pending"
                ? "active"
                : ""
            }

            onClick={() =>
              setActiveTab(
                "pending"
              )
            }

          >
            Pending
          </button>


          <button

            className={
              activeTab ===
                "approved"
                ? "active"
                : ""
            }

            onClick={() =>
              setActiveTab(
                "approved"
              )
            }

          >
            Approved
          </button>


          <button

            className={
              activeTab ===
                "rejected"
                ? "active"
                : ""
            }

            onClick={() =>
              setActiveTab(
                "rejected"
              )
            }

          >
            Rejected
          </button>


          <button

            className={
              activeTab ===
                "completed"
                ? "active"
                : ""
            }

            onClick={() =>
              setActiveTab(
                "completed"
              )
            }

          >
            Completed
          </button>


        </div>


        {/* =================================================
                    TABLE
                ================================================= */}

        <ERPTable

          columns={columns}

          data={filteredApplications}

          loading={loading}

          actions={(row) => (

            <BookingActions
              booking={row}

              onView={() =>
                navigate(`/transport/application/${row.TransportBookingID}`)
              }

              onEdit={() =>
                navigate(`/transport/application/${row.TransportBookingID}/edit`)
              }

              onCancel={() => {

                setSelectedBooking(row.TransportBookingID);
                setShowCancelDialog(true);

              }}
            />

          )}

        />


      </ERPSection>


      {/* =================================================
                CANCEL CONFIRMATION
            ================================================= */}

      <ERPConfirmDialog

        open={
          showCancelDialog
        }

        title="Cancel Transport Request"

        message={
          "Are you sure you want to cancel this transport request? This action cannot be undone."
        }

        confirmText="Yes, Cancel"

        cancelText="No"

        confirmButtonClass="danger-btn"

        loading={
          cancelLoading
        }

        onConfirm={
          cancelBooking
        }

        onCancel={() => {

          setShowCancelDialog(
            false
          );

          setSelectedBooking(
            null
          );

        }}

      />


    </ERPPage>

  );

}


export default TransportDashboard;