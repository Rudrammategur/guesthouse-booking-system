import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button";
import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import TakeAction from "../../components/Workflow/TakeAction";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";

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

    useEffect(() => {

        if (showCalendar || showAllocationModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };

    }, [showCalendar, showAllocationModal]);

    const fetchApplication = async () => {

        try {

            const res = await axios.get(

                `${API_URL}/api/verifier/application/${bookingId}`

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
                    <Button
                        onClick={() => setShowActionModal(true)}
                    >
                        Take Action
                    </Button>
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