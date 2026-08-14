import InfoCard from "../../Common/InfoCard/InfoCard";
import InfoRow from "../../Common/InfoRow/infoRow";
import ERPTable from "../../Common/ERPTable";
import Button from "../../Common/Button/Button";
import transportApi from "../../../api/transportApi";

function TransportApplicationDetails({ application }) {

    const handleViewDocument = async () => {

        try {

            const response = await transportApi.get(
                `/api/transport/application/${application.TransportBookingID}/document`,
                {
                    responseType: "blob"
                }
            );

            const url = URL.createObjectURL(
                response.data
            );

            window.open(url, "_blank");

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 60000);

        }
        catch (error) {

            console.error(
                "Transport document loading failed:",
                error
            );

        }

    };

    return (

        <div className="application-details">


            {/* ==========================================
                Traveller Information
            ========================================== */}

            <InfoCard
                title="Traveller Information"
            >

                <InfoRow
                    label="Traveller Name"
                    value={application.TravellerName}
                />

                <InfoRow
                    label="Contact Number"
                    value={application.TravellerContactNo}
                />

                <InfoRow
                    label="Traveller Email"
                    value={application.TravellerEmailID}
                />

                <InfoRow
                    label="Number of Travellers"
                    value={application.NumberOfTravellers}
                />

                <InfoRow
                    label="Address"
                    value={application.TravellerAddress}
                />

            </InfoCard>


            {/* ==========================================
                Journey Information
            ========================================== */}

            <InfoCard
                title="Journey Information"
            >

                <InfoRow
                    label="Booking Type"
                    value={application.BookingType}
                />

                <InfoRow
                    label="Seating Capacity"
                    value={application.SeatingCapacity}
                />

                <InfoRow
                    label="Departure Location"
                    value={application.DepartureLocation}
                />

                <InfoRow
                    label="Arrival Location"
                    value={application.ArrivalLocation}
                />

                <InfoRow
                    label="Departure"
                    value={
                        application.DepartureDateTime
                            ? new Date(
                                application.DepartureDateTime
                            ).toLocaleString()
                            : "-"
                    }
                />

                <InfoRow
                    label="Arrival"
                    value={
                        application.ArrivalDateTime
                            ? new Date(
                                application.ArrivalDateTime
                            ).toLocaleString()
                            : "-"
                    }
                />

                <InfoRow
                    label="Purpose of Travel"
                    value={application.PurposeOfTravel}
                />

            </InfoCard>


            {/* ==========================================
                Financial Information
            ========================================== */}

            <InfoCard
                title="Financial Information"
            >

                <InfoRow
                    label="Expenditure Head"
                    value={application.ExpenditureHead}
                />

                <InfoRow
                    label="Project Number"
                    value={
                        application.ProjectNo || "-"
                    }
                />

            </InfoCard>


            {/* ==========================================
                Booking Information
            ========================================== */}

            <InfoCard
                title="Booking Information"
            >

                <InfoRow
                    label="Booking Number"
                    value={application.TransportBookingNo}
                />

                <InfoRow
                    label="Booked By"
                    value={application.BookedBy}
                />

                <InfoRow
                    label="Booking Date"
                    value={
                        application.BookingDateTime
                            ? new Date(
                                application.BookingDateTime
                            ).toLocaleString()
                            : "-"
                    }
                />

                <InfoRow
                    label="Booking Status"
                    value={application.BookingStatus}
                />

                <InfoRow
                    label="Activity By"
                    value={application.ActivityBy}
                />

            </InfoCard>


            {/* ==========================================
                Additional Information
            ========================================== */}

            <InfoCard
                className="full-width"
                title="Additional Information"
            >

                <InfoRow
                    label="Additional Information"
                    value={application.AdditionalInfo}
                />

            </InfoCard>


            {/* ==========================================
                Workflow Assignment
            ========================================== */}

            <InfoCard
                className="full-width"
                title="Workflow Assignment"
            >

                <InfoRow
                    label="Verifier"
                    value={
                        application.AssignedVerifier?.RoleName ||
                        application.AssignedVerifierID ||
                        "-"
                    }
                />

                <InfoRow
                    label="Approver"
                    value={
                        application.AssignedApprover?.RoleName ||
                        application.AssignedApproverID ||
                        "-"
                    }
                />

                <InfoRow
                    label="Transport Office"
                    value={
                        application.AssignedTransportOffice?.RoleName ||
                        application.AssignedTransportOfficeID ||
                        "-"
                    }
                />

            </InfoCard>


            {/* ==========================================
                Supporting Documents
            ========================================== */}

            <InfoCard
                className="full-width"
                title="Supporting Documents"
            >

                <div className="supporting-document">

                    <span>
                        📎 Supporting document
                    </span>

                    {
                        application.SupportingDoc
                            ? (

                                <Button
                                    onClick={
                                        handleViewDocument
                                    }
                                >
                                    View Document
                                </Button>

                            )
                            : (

                                <p className="text-muted">
                                    No supporting document available.
                                </p>

                            )
                    }

                </div>

            </InfoCard>


        </div>

    );

}

export default TransportApplicationDetails;