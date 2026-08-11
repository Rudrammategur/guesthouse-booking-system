import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
// import ApplicationView from "./ApplicationView/ApplicationView";
import BookingPrint from "../Print/BookingPrint";
import "../Dashboard/dashboard.css";


function GuestHousePrintPage() {

  const { id } = useParams();
  const [data, setData] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {

    fetchData();

  }, []);

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

  }, []);

  const fetchData = async () => {
    const res = await api.get(
    `/api/master/application/${id}`
);
    setData(res.data);
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="print-container">

      <div className="print-header">
        <BookingPrint
    application={data}
/>
      </div>

    </div>
  );
}

export default GuestHousePrintPage;