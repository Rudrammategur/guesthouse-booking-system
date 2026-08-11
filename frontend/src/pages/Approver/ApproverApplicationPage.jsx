import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import Button from "../../components/Common/Button/Button";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";
import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import TakeAction from "../../components/Workflow/TakeAction";
import { getUserHeader } from "../../utils/userHeader";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

function ApproverApplicationPage() {

    const { bookingId } = useParams();

    const [application, setApplication] = useState(null);

    const [showActionModal, setShowActionModal] =
        useState(false);

    useEffect(() => {

        fetchApplication();

    }, [bookingId]);

    const fetchApplication = async () => {

        try {

            const res = await api.get(
                `/api/approver/application/${bookingId}`
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
                        onClick={() =>
                            setShowActionModal(true)
                        }
                    >
                        Take Action
                    </Button>

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

                    actionType="Approver"

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

export default ApproverApplicationPage;