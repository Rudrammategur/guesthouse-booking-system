import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import InfoCard from "../../components/Common/InfoCard/InfoCard";
import Button from "../../components/Common/Button/Button";

import logo from "../../assets/iit-dharwad-logo.png";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "/guesthouse-api";

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("en-IN")
        : "-";

function GHReceiptPage() {

    const { bookingId } = useParams();

    const [receipt, setReceipt] = useState(null);

    useEffect(() => {

        api
            .get(`/api/gh-incharge/receipt/${bookingId}`)
            .then(res => setReceipt(res.data));

    }, [bookingId]);

    if (!receipt) return <h3>Loading...</h3>;

    return (

        <ERPPage>

            {/* <PageHeader
                hero
                logo={logo}
                title="Guest House Management System"
                subtitle="Receipt"
            /> */}

            <InfoCard className="print-area">

                <div className="receipt">

                    <h2>IIT Dharwad Guest House Receipt</h2>

                    <div className="receipt-row">
                        <span>Booking No</span>
                        <strong>{receipt.GHRBookingNo}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Guest</span>
                        <strong>{receipt.GuestName}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Guest House</span>
                        <strong>{receipt.GuestHouseName}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Arrival</span>
                        <strong>{formatDate(receipt.ArrivalDateTime)}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Departure</span>
                        <strong>{formatDate(receipt.DepartureDateTime)}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Room</span>
                        <strong>{receipt.RoomNumbers || "-"}</strong>
                    </div>

                    <hr />

                    <div className="receipt-row">
                        <span>Accommodation</span>
                        <strong>₹ {receipt.AccommodationAmount}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Additional Charges</span>
                        <strong>₹ {receipt.AdditionalCharges}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Discount</span>
                        <strong>₹ {receipt.DiscountAmount}</strong>
                    </div>

                    <div className="receipt-total">

                        <span>Total Payable</span>

                        <strong>

                            ₹ {receipt.TotalPayableAmount}

                        </strong>

                    </div>

                    <hr />

                    <div className="receipt-row">
                        <span>Payment Mode</span>
                        <strong>{receipt.PaymentMode || "-"}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Transaction Ref.</span>
                        <strong>{receipt.TransactionReference || "-"}</strong>
                    </div>

                    <p className="receipt-footer">

                        Thank you for staying at IIT Dharwad Guest House.

                    </p>

                    <Button
                        onClick={() => window.print()}
                    >
                        Print Receipt
                    </Button>

                </div>

            </InfoCard>

        </ERPPage>

    );

}

export default GHReceiptPage;