
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import Button from "../../components/Common/Button/Button";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";
import TransportApplicationView from "../../components/Dashboard/TransportApplicationView/TransportApplicationView";
import TakeAction from "../../components/Workflow/TakeAction";


function TransportApproverApplicationPage() {

    const { transportBookingId } = useParams();

    const [application, setApplication] =
        useState(null);

    const [showActionModal, setShowActionModal] =
        useState(false);


    const fetchApplication = async () => {

        try {

            const res = await api.get(
                `/api/transport-approver/application/${transportBookingId}`
            );

            console.log(
                "Transport Approver Application:",
                res.data
            );

            setApplication(
                res.data.data
            );

        }

        catch (err) {

            console.error(
                "Failed to fetch transport approver application:",
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

                    application.BookingStatus === "Verified" &&(<Button
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

                    actionType="Approver"

                    bookingId={
                        application.TransportBookingID
                    }

                    verifyUrl="/api/transport-approver/approve"

                    rejectUrl="/api/transport-approver/reject"

                    redirectPath="/transport-approver"

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


export default TransportApproverApplicationPage;
