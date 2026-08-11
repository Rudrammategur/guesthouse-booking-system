import InfoCard from "../../Common/InfoCard/InfoCard";
import InfoRow from "../../Common/InfoRow/infoRow";
import StatusBadge from "../../Common/StatusBadge";
import ERPTable from "../../Common/ERPTable";
import Button from "../../Common/Button/Button";
import api from "../../../api/axios";

function ApplicationDetails({ application }) {

    const showPaymentSummary =
        application?.BookingStatus === "Checked Out";

    const handleViewDocument = async () => {
        try {
            const response = await api.get(
                `/api/guesthouse/application/${application.GHBookingID}/document`,
                {
                    responseType: "blob"
                }
            );

            const url = URL.createObjectURL(response.data);

            window.open(url, "_blank");

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 60000);

        } catch (error) {
            console.error("Document loading failed:", error);
        }
    };

    return (

        <>
            <div className="application-details">


                {/* Guest Information */}

                <InfoCard
                    title="Guest Information"
                >

                    <InfoRow label="Guest Type" value={application.GuestTypeName} />

                    <InfoRow label="Guest Name" value={application.GuestName} />

                    <InfoRow label="Designation" value={application.GuestDesignation} />

                    {/* <InfoRow label="Relationship" value={application.GuestRelationship} /> */}

                    <InfoRow label="Nationality" value={application.GuestNationality} />

                    <InfoRow label="Contact Number" value={application.GuestContactNo} />

                    <InfoRow label="Guest Email" value={application.GuestEmailID} />

                    <InfoRow label="Address" value={application.GuestAddress} />

                </InfoCard>


                {/* Visit */}

                <InfoCard
                    title="Visit Information"
                >

                    <InfoRow label="Purpose" value={application.PurposeOfVisit} />

                    <InfoRow label="Arrival" value={new Date(application.ArrivalDateTime).toLocaleString()} />

                    <InfoRow label="Departure" value={new Date(application.DepartureDateTime).toLocaleString()} />

                    <InfoRow label="Occupants" value={application.OccupantsNo} />

                    <InfoRow label="Special Request" value={application.SplRequests} />

                </InfoCard>


                {/* Accommodation */}

                <InfoCard
                    title="Accommodation"
                >

                    <InfoRow
                        label="Guest House"
                        value={application.GuestHouseName}
                    />

                    <InfoRow
                        label="Rooms Requested"
                        value={application.TotalRoomsReq}
                    />

                </InfoCard>


                {/* Financial */}

                <InfoCard
                    title="Financial Information"
                >

                    <InfoRow
                        label="Expenditure Head"
                        value={application.ExpenditureHead}
                    />

                    <InfoRow
                        label="Project Number"
                        value={application.ProjectNo || "-"}
                    />

                </InfoCard>


                {/* Workflow */}

                <InfoCard
                    className="full-width"
                    title="Workflow Assignment"
                >

                    <InfoRow
                        label="Verifier"
                        value={application.AssignedVerifier?.RoleName || "-"}
                    />

                    <InfoRow
                        label="Approver"
                        value={application.AssignedApprover?.RoleName || "-"}
                    />

                    <InfoRow
                        label="GH Incharge"
                        value={application.AssignedAllocator?.RoleName || "-"}
                    />

                </InfoCard>


                {/* Requested Rooms */}

                <InfoCard
                    className="full-width"
                    title="Requested Room Types"
                >

                    <ERPTable
                        rowNumber={false}
                        searchable={false}
                        columns={[
                            {
                                key: "RoomTypeName",
                                label: "Room Type"
                            },
                            {
                                key: "NoOfRooms",
                                label: "Rooms"
                            }
                        ]}
                        data={application.RoomRequirements ?? []}
                    />

                </InfoCard>

                {
                    showPaymentSummary && (


                        <InfoCard title="Payment Summary">

                            <div className="summary-row">
                                <span>Accommodation</span>
                                <strong>₹ {application.AccommodationAmount}</strong>
                            </div>

                            {/* <div className="summary-row">
                                <span>Meal Charges</span>
                                <strong>₹ {application.MealCharges}</strong>
                            </div> */}

                            <div className="summary-row">
                                <span>Additional Charges</span>
                                <strong>₹ {application.AdditionalCharges}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Discount</span>
                                <strong>₹ {application.DiscountAmount}</strong>
                            </div>

                            <hr />

                            <div className="summary-total">
                                <span>Total Payable</span>
                                <strong>
                                    ₹ {application.TotalPayableAmount}
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Payment Mode</span>
                                <strong>{application.PaymentMode || "-"}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Transaction Ref.</span>
                                <strong>{application.TransactionReference || "-"}</strong>
                            </div>

                        </InfoCard>
                    )
                }


                {/* Documents */}

                <InfoCard
                    className="full-width"
                    title="Supporting Documents"
                >

                    <div className="supporting-document">

                        <span>
                            📎 Supporting document
                        </span>

                        {application.HasSupportingDoc ? (
                            <Button onClick={handleViewDocument}>
                                View Document
                            </Button>
                        ) : (
                            <p className="text-muted">
                                No supporting document available.
                            </p>
                        )}

                    </div>

                </InfoCard>

            </div >
        </>

    );

}

export default ApplicationDetails;