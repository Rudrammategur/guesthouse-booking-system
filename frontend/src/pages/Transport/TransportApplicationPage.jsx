import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import transportApi from "../../api/transportApi";

import TransportApplicationView from "../../components/Dashboard/TransportApplicationView/TransportApplicationView";


function TransportApplicationPage() {

    const { transportBookingId } = useParams();

    const [application, setApplication] =
        useState(null);

    useEffect(() => {

        if (transportBookingId) {
            loadApplication();
        }

    }, [transportBookingId]);

    const loadApplication = async () => {

        try {

            const res = await transportApi.get(
                `/api/transport/application/${transportBookingId}`
            );

            console.log(
                "Transport Application:",
                res.data
            );

            const response = res.data.data;

            setApplication({

                ...response.application,

                Header:
                    response.header,

                WorkflowHistory:
                    response.workflowHistory ||
                    response.WorkflowLogs ||
                    []

            });

        }
        catch (err) {

            console.error(
                "Unable to load transport application:",
                err
            );

        }

    };

    if (!application) {

        return (
            <h3>
                Loading...
            </h3>
        );

    }

    return (

        <TransportApplicationView
            application={application}
        />

    );

}

export default TransportApplicationPage;