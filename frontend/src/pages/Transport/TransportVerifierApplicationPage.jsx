import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import Button from "../../components/Common/Button/Button";
import TransportApplicationView from "../../components/Dashboard/TransportApplicationView/TransportApplicationView";
import TakeAction from "../../components/Workflow/TakeAction";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";

function TransportVerifierApplicationPage() {

    const { transportBookingId } = useParams();

    const navigate = useNavigate();

    const [application, setApplication] =
        useState(null);

    const [showActionModal, setShowActionModal] =
        useState(false);


    const fetchApplication = async () => {

        try {

            const res = await api.get(
                `/api/transport-verifier/application/${transportBookingId}`
            );

            console.log(
                "Transport Verifier Application:",
                res.data
            );

            setApplication(
                res.data.data
            );

        }

        catch (err) {

            console.error(
                "Failed to fetch transport application:",
                err
            );

        }

    };


    useEffect(() => {

        fetchApplication();

    }, [transportBookingId]);


    if (!application) {

        return <h3>Loading...</h3>;

    }


    return (

        <ERPPage>

            <TransportApplicationView

                application={application}

                extraActions={

                    application.BookingStatus === "Submitted" &&(<Button
                        onClick={() =>
                            setShowActionModal(true)
                        }
                    >
                        Take Action
                    </Button>)

                }

            />


            <ERPFormModal

                open={showActionModal}

                title="Take Action"

                showFooter={false}

                onClose={() =>
                    setShowActionModal(false)
                }

            >

                <TakeAction
                    application={application}
                    actionType="Verifier"

                    bookingId={
                        application.TransportBookingID
                    }

                    verifyUrl="/api/transport-verifier/verify"
                    rejectUrl="/api/transport-verifier/reject"

                    redirectPath="/transport-verifier"

                    showHeader={false}

                    onSuccess={() => {
                        setShowActionModal(false);
                        fetchApplication();
                    }}
                />

            </ERPFormModal>

        </ERPPage>

    );

}

export default TransportVerifierApplicationPage;