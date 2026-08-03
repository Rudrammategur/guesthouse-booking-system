import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

function GHInchargeApplicationPage() {

    const { bookingId } = useParams();

    const [application, setApplication] = useState(null);

    useEffect(() => {

        fetchApplication();

    }, [bookingId]);

    const fetchApplication = async () => {

        try {

            const res = await axios.get(
                `${API_URL}/api/gh-incharge/applications/${bookingId}`
            );

            setApplication(res.data.data);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (!application)

        return <h2>Loading...</h2>;

    return (
                <ApplicationView
                    application={application}
                />
    );

}

export default GHInchargeApplicationPage;