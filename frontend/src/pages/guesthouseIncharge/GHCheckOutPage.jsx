import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/ghCheckOut.css";
import ApplicationSummary from "../../components/Dashboard/ApplicationView/ApplicationSummary";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button";
import InfoCard from "../../components/Common/InfoCard/InfoCard";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";
import CheckOutPanel from "./CheckOutPanel";

import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";

import ERPFormField from "../../components/Common/Form/ERPFormField";

const API_URL = import.meta.env.VITE_API_URL || "/guesthouse-api";

function GHCheckOutPage() {

    const navigate = useNavigate();
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);

    const [rooms, setRooms] = useState([]);

    console.log("BookingId:", bookingId);

    const [accommodationAmount,
        setAccommodationAmount] =
        useState(0);

    const [mealCharges,
        setMealCharges] =
        useState(0);

    const [additionalCharges,
        setAdditionalCharges] =
        useState(0);

    const [discount,
        setDiscount] =
        useState(0);

    const [paymentMode,
        setPaymentMode] =
        useState("");

    const [transactionReference,
        setTransactionReference] =
        useState("");



    const totalPayableAmount =
        Number(accommodationAmount)
        +
        Number(mealCharges)
        +
        Number(additionalCharges)
        -
        Number(discount);

    const handleCheckout = async () => {

        try {

            await axios.post(

                `${API_URL}/api/gh-incharge/checkout/${bookingId}`,

                {

                    mealCharges,

                    additionalCharges,

                    discount,

                    paymentMode,

                    transactionReference,

                    totalPayableAmount

                }

            );

            alert("Guest Checked Out Successfully");

            navigate(

                `/gh-incharge/receipt/${bookingId}`

            );

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.message ||

                "Check-Out Failed"

            );

        }

    };

    useEffect(() => {

        loadBooking();

    }, []);

    const loadBooking = async () => {

        const res =
            await axios.get(
                `${API_URL}/api/gh-incharge/checkout/${bookingId}`
            );

        console.log(res.data.data);

        setBooking(res.data.data);

        setRooms(res.data.rooms);

    };

    useEffect(() => {

        if (booking) {

            setAccommodationAmount(
                booking.AccommodationAmount || 0
            );

            setMealCharges(
                booking.MealCharges || 0
            );

            setAdditionalCharges(
                booking.AdditionalCharges || 0
            );

            setDiscount(
                booking.DiscountAmount || 0
            );

        }

    }, [booking]);

    console.log("Booking:", booking);

    return (
                  <>  

                        <ApplicationView
                            application={booking}
                            hideHeader
                            hideSummary
                            extraActions={
                                <Button
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Check-Out
                                </Button>
                            }
                        />

                    

                    <ERPFormModal
                        open={showCheckout}
                        title="Guest Check-Out"
                        onClose={() => setShowCheckout(false)}
                        showFooter={false}
                        size="lg"
                    >
                        <CheckOutPanel
                            booking={booking}
                            mealCharges={mealCharges}
                            setMealCharges={setMealCharges}
                            additionalCharges={additionalCharges}
                            setAdditionalCharges={setAdditionalCharges}
                            discount={discount}
                            setDiscount={setDiscount}
                            paymentMode={paymentMode}
                            setPaymentMode={setPaymentMode}
                            transactionReference={transactionReference}
                            setTransactionReference={setTransactionReference}
                            totalPayableAmount={totalPayableAmount}
                            onSubmit={handleCheckout}
                        />
                    </ERPFormModal>
                    </>

                

    );
}

export default GHCheckOutPage;