import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button";
import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import TakeAction from "../../components/Workflow/TakeAction";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";
import { getUserHeader } from "../../utils/userHeader";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

function VerifierApplicationPage() {

    const { bookingId } = useParams();

    const navigate = useNavigate();

    const [application, setApplication] = useState(null);

    const [showActionModal, setShowActionModal] =
        useState(false);

    useEffect(() => {

        fetchApplication();

    }, [bookingId]);

    // useEffect(() => {

    //     if (showCalendar || showAllocationModal) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "auto";
    //     }

    //     return () => {
    //         document.body.style.overflow = "auto";
    //     };

    // }, [showCalendar, showAllocationModal]);

    const fetchApplication = async () => {

        try {

            const res = await api.get(
                `/api/verifier/application/${bookingId}`
            );

            console.log(res.data);

            setApplication(res.data.data);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!application)

        return <h3>Loading...</h3>;

    return (

        <ERPPage>

            <ApplicationView
                application={application}
                extraActions={

                    application.BookingStatus === "Submitted" && (

                        <Button
                            onClick={() =>
                                setShowActionModal(true)
                            }
                        >
                            Take Action
                        </Button>

                    )

                }
            />

            <ERPFormModal
                open={showActionModal}
                title="Take Action"
                showFooter={false}
                onClose={() => setShowActionModal(false)}
            >
                <TakeAction
                    application={application}
                    actionType="Verifier"

                    bookingId={
                        application.GHBookingID
                    }

                    verifyUrl="/api/verifier/verify"
                    rejectUrl="/api/verifier/reject"

                    redirectPath="/verifier"

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

export default VerifierApplicationPage;