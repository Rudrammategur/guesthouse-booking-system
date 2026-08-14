import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import transportApi from "../../api/transportApi";

import TransportBookingPrint
    from "../Print/TransportBookingPrint";

import "../Dashboard/dashboard.css";


function TransportPrintPage() {

    const { id } = useParams();

    const [data, setData] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {

        fetchData();

    }, [id]);


    useEffect(() => {

        if (data) {

            setTimeout(() => {

                window.print();

            }, 500);

        }

    }, [data]);


    useEffect(() => {

        const handleAfterPrint = () => {

            navigate(-1);

        };

        window.addEventListener(
            "afterprint",
            handleAfterPrint
        );


        return () => {

            window.removeEventListener(
                "afterprint",
                handleAfterPrint
            );

        };

    }, [navigate]);


    const fetchData = async () => {

        try {

            const res = await transportApi.get(
                `/api/transport/application/${id}/print`
            );

            console.log(
                "Transport print response:",
                res.data
            );


            /*
             * Transport API response is expected to be:
             *
             * {
             *    success: true,
             *    data: {
             *       application: {...},
             *       ...
             *    }
             * }
             */

            setData(res.data.data);

        }

        catch (error) {

            console.error(
                "Unable to load transport print data:",
                error
            );

        }

    };


    if (!data) {

        return <p>Loading...</p>;

    }


    return (

        <div className="print-container">

            <TransportBookingPrint
                application={data}
            />

        </div>

    );

}


export default TransportPrintPage;