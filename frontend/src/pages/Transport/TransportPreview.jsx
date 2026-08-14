import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/guestHousePreview.css";
import { toast } from "react-toastify";
import transportApi from "../../api/transportApi";

function TransportPreview() {

    const navigate = useNavigate();
    const location = useLocation();

    // ---------------------------------------------------------
    // Get saved draft + navigation state
    // ---------------------------------------------------------

    const localData =
        JSON.parse(
            localStorage.getItem("transportDraft")
        ) || {};

    const data = {
        ...localData,
        ...(location.state || {})
    };

    console.log(
        "=========== TRANSPORT PREVIEW ==========="
    );

    console.log("Preview Data:", data);
    console.log("location.state =", location.state);
    console.log("localData =", localData);


    // ---------------------------------------------------------
    // Format Date & Time
    // ---------------------------------------------------------

    const formatDateTime = (date) => {

        if (!date) {
            return "-";
        }

        try {

            const parsedDate =
                new Date(date);

            if (isNaN(parsedDate.getTime())) {
                return "-";
            }

            return parsedDate.toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }
            );

        }
        catch (error) {

            console.error(
                "Date formatting error:",
                error
            );

            return "-";

        }

    };


    // ---------------------------------------------------------
    // Calculate Journey Duration
    // ---------------------------------------------------------

    const calculateDuration = () => {

        if (
            !data.departureDateTime ||
            !data.arrivalDateTime
        ) {

            return "-";

        }


        const departure =
            new Date(
                data.departureDateTime
            );

        const arrival =
            new Date(
                data.arrivalDateTime
            );


        if (
            isNaN(departure.getTime()) ||
            isNaN(arrival.getTime())
        ) {

            return "-";

        }


        const difference =
            arrival.getTime() -
            departure.getTime();


        if (difference <= 0) {

            return "0 Hours";

        }


        const totalMinutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        const days =
            Math.floor(
                totalMinutes /
                (24 * 60)
            );


        const remainingMinutes =
            totalMinutes -
            days * 24 * 60;


        const hours =
            Math.floor(
                remainingMinutes / 60
            );


        const minutes =
            remainingMinutes % 60;


        const parts = [];


        if (days > 0) {

            parts.push(
                `${days} Day(s)`
            );

        }


        if (hours > 0) {

            parts.push(
                `${hours} Hour(s)`
            );

        }


        if (minutes > 0) {

            parts.push(
                `${minutes} Minute(s)`
            );

        }


        return parts.length > 0
            ? parts.join(" ")
            : "0 Hours";

    };


    // ---------------------------------------------------------
    // Open Uploaded Document
    // ---------------------------------------------------------

    const openDocument = async () => {

        if (!data?.uploadedFileUrl) {

            return;

        }


        try {

            const response =
                await fetch(
                    data.uploadedFileUrl
                );


            const blob =
                await response.blob();


            const blobUrl =
                URL.createObjectURL(
                    blob
                );


            window.open(
                blobUrl,
                "_blank"
            );

        }
        catch (error) {

            console.error(
                "Unable to open document:",
                error
            );

            toast.error(
                "Unable to open document."
            );

        }

    };


    // ---------------------------------------------------------
    // Check Uploaded File Type
    // ---------------------------------------------------------

    const isImage =
        data?.uploadedFileUrl &&
        (
            data.uploadedFileName?.toLowerCase().endsWith(".jpg") ||
            data.uploadedFileName?.toLowerCase().endsWith(".jpeg") ||
            data.uploadedFileName?.toLowerCase().endsWith(".png")
        );


    // ---------------------------------------------------------
    // Submit
    // ---------------------------------------------------------

    const handleSubmit = async () => {

        try {

            const formData = new FormData();

            const departureISO =
                data.departureDateTime
                    ? new Date(data.departureDateTime).toISOString()
                    : "";

            const arrivalISO =
                data.arrivalDateTime
                    ? new Date(data.arrivalDateTime).toISOString()
                    : "";

            // ==========================================
            // BOOKING DETAILS
            // ==========================================

            formData.append(
                "SeatingCapacity",
                data.seatingCapacity
            );

            formData.append(
                "BookingType",
                data.bookingType
            );

            formData.append(
                "ExpenditureHead",
                data.expenditureHeadType
            );

            formData.append(
                "ProjectNo",
                data.projectDetails || ""
            );


            // ==========================================
            // TRAVELLER DETAILS
            // ==========================================

            formData.append(
                "TravellerName",
                data.travellerName
            );

            formData.append(
                "TravellerAddress",
                data.travellerAddress
            );

            formData.append(
                "NumberOfTravellers",
                Number(data.numberOfTravellers)
            );

            formData.append(
                "TravellerContactNo",
                data.travellerContact
            );

            formData.append(
                "TravellerEmailID",
                data.travellerEmail
            );


            // ==========================================
            // JOURNEY DETAILS
            // ==========================================

            formData.append(
                "DepartureLocation",
                data.departureLocation
            );

            formData.append(
                "ArrivalLocation",
                data.arrivalLocation
            );

            formData.append(
                "DepartureDateTime",
                departureISO
            );

            formData.append(
                "ArrivalDateTime",
                arrivalISO
            );

            formData.append(
                "PurposeOfTravel",
                data.purposeOfTravel
            );


            // ==========================================
            // ADDITIONAL INFORMATION
            // ==========================================

            formData.append(
                "AdditionalInfo",
                data.additionalInfo || ""
            );


            // ==========================================
            // SUPPORTING DOCUMENT
            // ==========================================

            if (data.uploadedFile) {

                formData.append(
                    "SupportingDoc",
                    data.uploadedFile
                );

            }


            // ==========================================
            // DEBUG
            // ==========================================

            console.log(
                "===== TRANSPORT FORM DATA ====="
            );

            for (const [key, value] of formData.entries()) {

                console.log(
                    key,
                    value
                );

            }

            console.log("===== TRANSPORT DATE DEBUG =====");

            console.log(
                "data.departureDateTime:",
                data.departureDateTime,
                "type:",
                typeof data.departureDateTime
            );

            console.log(
                "data.arrivalDateTime:",
                data.arrivalDateTime,
                "type:",
                typeof data.arrivalDateTime
            );

            console.log("departureISO:", departureISO);
            console.log("arrivalISO:", arrivalISO);

            console.log("===== FINAL TRANSPORT FORM DATA =====");

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }


            // ==========================================
            // SUBMIT
            // ==========================================

            await transportApi.post(
                "/api/transport",
                formData
            );


            toast.success(
                "Transport request submitted successfully."
            );


            localStorage.removeItem(
                "transportDraft"
            );


            navigate(
                "/transport",
                {
                    replace: true
                }
            );

        }
        catch (err) {

            console.error(
                "TRANSPORT SUBMISSION ERROR:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Transport request submission failed."
            );

        }

    };


    // ---------------------------------------------------------
    // No Data
    // ---------------------------------------------------------

    if (
        !data ||
        Object.keys(data).length === 0
    ) {

        return (

            <div className="preview-container">

                <div className="preview-card">

                    <h2>
                        No Transport Draft Found
                    </h2>


                    <button
                        className="edit-btn"
                        onClick={() =>
                            navigate(
                                "/transport/apply"
                            )
                        }
                    >
                        Back to Transport Form
                    </button>

                </div>

            </div>

        );

    }


    // ---------------------------------------------------------
    // Render Preview
    // ---------------------------------------------------------

    return (

        <div className="preview-container">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="preview-header">

                <h1>
                    Transport Request Preview
                </h1>

                <p>
                    Please review the transport request
                    details before submitting.
                </p>

            </div>


            {/* =================================================
                VEHICLE DETAILS
            ================================================= */}

            <div className="preview-card">

                <h2>
                    🚗 Vehicle Details
                </h2>


                <div className="preview-grid">

                    {/* Seating Capacity */}

                    <div className="preview-item">

                        <label>
                            Seating Capacity
                        </label>

                        <span>
                            {
                                data.seatingCapacity
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Booking Type */}

                    <div className="preview-item">

                        <label>
                            Type of Booking
                        </label>

                        <span>
                            {
                                data.bookingType
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Expenditure Head */}

                    <div className="preview-item">

                        <label>
                            Expenditure Head
                        </label>

                        <span>
                            {
                                data.expenditureHeadType
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Project */}

                    {
                        data.expenditureHeadType ===
                        "Project Fund" && (

                            <div className="preview-item">

                                <label>
                                    Project
                                </label>

                                <span>
                                    {
                                        data.projectDetails
                                        || "-"
                                    }
                                </span>

                            </div>

                        )
                    }

                </div>

            </div>


            {/* =================================================
                TRAVELLER DETAILS
            ================================================= */}

            <div className="preview-card">

                <h2>
                    👤 Traveller Details
                </h2>


                <div className="preview-grid">


                    {/* Traveller Name */}

                    <div className="preview-item">

                        <label>
                            Traveller Name
                        </label>

                        <span>
                            {
                                data.travellerName
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Number of Travellers */}

                    <div className="preview-item">

                        <label>
                            Number of Travellers
                        </label>

                        <span>
                            {
                                data.numberOfTravellers
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Mobile */}

                    <div className="preview-item">

                        <label>
                            Contact Number
                        </label>

                        <span>
                            {
                                data.travellerContact
                                ||
                                (
                                    data.countryCode &&
                                        data.travellerMobile
                                        ? `${data.countryCode}${data.travellerMobile}`
                                        : "-"
                                )
                            }
                        </span>

                    </div>


                    {/* Email */}

                    <div className="preview-item">

                        <label>
                            Traveller Email
                        </label>

                        <span>
                            {
                                data.travellerEmail
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Address */}

                    <div className="preview-item full-width">

                        <label>
                            Traveller Address
                        </label>

                        <span>
                            {
                                data.travellerAddress
                                || "-"
                            }
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                JOURNEY DETAILS
            ================================================= */}

            <div className="preview-card">

                <h2>
                    📍 Journey Details
                </h2>


                <div className="preview-grid">


                    {/* Departure */}

                    <div className="preview-item">

                        <label>
                            Departure Location
                        </label>

                        <span>
                            {
                                data.departureLocation
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Arrival */}

                    <div className="preview-item">

                        <label>
                            Arrival Location
                        </label>

                        <span>
                            {
                                data.arrivalLocation
                                || "-"
                            }
                        </span>

                    </div>


                    {/* Departure Date */}

                    <div className="preview-item">

                        <label>
                            Departure Date & Time
                        </label>

                        <span>
                            {
                                formatDateTime(
                                    data.departureDateTime
                                )
                            }
                        </span>

                    </div>


                    {/* Arrival Date */}

                    <div className="preview-item">

                        <label>
                            Arrival Date & Time
                        </label>

                        <span>
                            {
                                formatDateTime(
                                    data.arrivalDateTime
                                )
                            }
                        </span>

                    </div>


                    {/* Duration */}

                    <div className="preview-item">

                        <label>
                            Total Journey Duration
                        </label>

                        <span>
                            {
                                calculateDuration()
                            }
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                PURPOSE & ADDITIONAL INFORMATION
            ================================================= */}

            <div className="preview-card">

                <h2>
                    📝 Purpose & Additional Information
                </h2>


                {/* Purpose */}

                <div className="preview-item full-width">

                    <label>
                        Purpose of Travel
                    </label>

                    <span>
                        {
                            data.purposeOfTravel
                            || "-"
                        }
                    </span>

                </div>


                {/* Additional Information */}

                <div className="preview-item full-width">

                    <label>
                        Additional Information
                    </label>

                    <span>
                        {
                            data.special
                            || "-"
                        }
                    </span>

                </div>

            </div>

            {/* =================================================
                SUPPORTING DOCUMENT
            ================================================= */}

            {data?.uploadedFileUrl && (

                <div className="preview-card document-card">

                    <h2>
                        📎 Supporting Document
                    </h2>

                    <div className="document-preview">

                        {isImage ? (

                            <img
                                src={data.uploadedFileUrl}
                                className="preview-image"
                                alt="Supporting document"
                            />

                        ) : (

                            <div className="file-box">

                                <span>📄</span>

                                <strong>
                                    {data.uploadedFileName || "Document Uploaded"}
                                </strong>

                            </div>

                        )}

                    </div>

                    <div className="document-actions">

                        <button
                            type="button"
                            className="view-btn"
                            onClick={openDocument}
                        >
                            View Document
                        </button>

                        <a
                            href={data.uploadedFileUrl}
                            download={data.uploadedFileName || "TransportDocument"}
                            className="download-btn"
                        >
                            Download
                        </a>

                    </div>

                </div>

            )}


            {/* =================================================
                WORKFLOW
            ================================================= */}

            <div className="transport-workflow-card">

                <h4>
                    Approval Workflow
                </h4>

                <div className="transport-workflow">

                    <span>
                        Applicant
                    </span>

                    <span className="workflow-arrow">
                        ➜
                    </span>

                    <span>
                        C&amp;S Office
                    </span>

                    <span className="workflow-arrow">
                        ➜
                    </span>

                    <span>
                        Dean Admin / Dean R&amp;D
                    </span>

                    <span className="workflow-arrow">
                        ➜
                    </span>

                    <span>
                        Transport Office
                    </span>

                </div>

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="button-container">


                <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                        navigate(
                            "/transport/apply",
                            {
                                state: data
                            }
                        )
                    }
                >
                    Edit
                </button>


                <button
                    type="button"
                    className="submit-btn"
                    onClick={
                        handleSubmit
                    }
                >
                    Submit Request
                </button>


            </div>


        </div>

    );

}

export default TransportPreview;