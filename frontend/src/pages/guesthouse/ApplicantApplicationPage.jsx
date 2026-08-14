import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import { getUserHeader } from "../../utils/userHeader";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

function ApplicantApplicationPage() {

    const { bookingId } = useParams();

    console.log("ApplicantApplicationPage URL:", window.location.pathname);
    console.log("ApplicantApplicationPage bookingId:", bookingId);

    const [application, setApplication] = useState(null);

    useEffect(() => {

        loadApplication();

    }, [bookingId]);

    const loadApplication = async () => {

        try {

            const res = await api.get(
                `/api/guesthouse/application/${bookingId}`
            )
            const response = res.data.data;

            setApplication({

                ...response.application,

                Header: response.header,

                RoomRequirements: response.roomRequirements,

                WorkflowHistory: response.workflowHistory

            });

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!application)

        return <h3>Loading...</h3>;

    return (

        <ApplicationView
            application={application}
        />

    );

}

export default ApplicantApplicationPage;