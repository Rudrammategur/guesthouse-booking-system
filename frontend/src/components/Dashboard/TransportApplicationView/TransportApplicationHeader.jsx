import { useNavigate } from "react-router-dom";

import PageHeader from "../../Common/PageHeader";
import Button from "../../Common/Button/Button";
import StatusBadge from "../../Common/StatusBadge";

import "../ApplicationView/ApplicationView.css";

function TransportApplicationHeader({
    application,
    extraActions
}) {

    const navigate = useNavigate();

    const handlePrint = () => {

        navigate(
            `/transport/print/${application.TransportBookingID}`
        );

    };

    return (

        <PageHeader

            title="Transport Application"

            subtitle={

                <div className="application-header-info">

                    <span>

                        <strong>Applicant :</strong>

                        {application.ApplicantName ||
                            application.TravellerName ||
                            "-"}

                    </span>


                    <span>

                        <strong>Booking No :</strong>

                        {application.TransportBookingNo || "-"}

                    </span>


                    <span>

                        <strong>Submitted On:</strong>

                        {application.BookingDateTime
                            ? new Date(
                                application.BookingDateTime
                            ).toLocaleString("en-IN")
                            : "-"}

                    </span>

                </div>

            }

            actions={

                <div className="application-header-actions">

                    <StatusBadge
                        status={application.BookingStatus}
                    />


                    <Button

                        variant="outline"

                        onClick={() => navigate(-1)}

                    >

                        ← Back

                    </Button>


                    <Button

                        onClick={handlePrint}

                    >

                        Print

                    </Button>


                    {extraActions}

                </div>

            }

        />

    );

}

export default TransportApplicationHeader;