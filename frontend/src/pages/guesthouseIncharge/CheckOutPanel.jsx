import InfoCard from "../../components/Common/InfoCard/InfoCard";
import ERPFormField from "../../components/Common/Form/ERPFormField";
import ERPSelectField from "../../components/Common/Form/ERPSelectField";
import Button from "../../components/Common/Button/Button";

function CheckOutPanel({

    booking,

    additionalCharges,
    setAdditionalCharges,

    discount,
    setDiscount,

    paymentMode,
    setPaymentMode,

    transactionReference,
    setTransactionReference,

    totalPayableAmount,

    onSubmit

}) {

    return (

        <div className="checkout-panel">

            <InfoCard title="Departure Checklist">

                <label className="check-item">
                    <input type="checkbox"/>
                    Room Keys Returned
                </label>

                <label className="check-item">
                    <input type="checkbox"/>
                    Room Inspected
                </label>

                <label className="check-item">
                    <input type="checkbox"/>
                    No Damages Found
                </label>

                <label className="check-item">
                    <input type="checkbox"/>
                    Guest Belongings Cleared
                </label>

            </InfoCard>


            <InfoCard title="Accommodation Charges">

                <div className="occupant-grid">

                    <ERPFormField
                        label="Accommodation"
                        value={booking?.AccommodationAmount || 0}
                        disabled
                    />

                    {/* <ERPFormField
                        label="Meal Charges"
                        type="number"
                        value={mealCharges}
                        onChange={(e)=>
                            setMealCharges(e.target.value)
                        }
                    /> */}

                    <ERPFormField
                        label="Additional Charges"
                        type="number"
                        value={additionalCharges}
                        onChange={(e)=>
                            setAdditionalCharges(e.target.value)
                        }
                    />

                    <ERPFormField
                        label="Discount"
                        type="number"
                        value={discount}
                        onChange={(e)=>
                            setDiscount(e.target.value)
                        }
                    />

                </div>

            </InfoCard>


            <InfoCard title="Payment">

                <div className="occupant-grid">

                    <ERPSelectField
                        label="Payment Mode"
                        value={paymentMode}
                        options={[
                            {label:"UPI",value:"UPI"},
                            {label:"Card",value:"Card"},
                            {label:"Bank Transfer",value:"Bank Transfer"}
                        ]}
                        onChange={(e)=>
                            setPaymentMode(e.target.value)
                        }
                    />

                    <ERPFormField
                        label="Transaction Reference"
                        value={transactionReference}
                        onChange={(e)=>
                            setTransactionReference(
                                e.target.value
                            )
                        }
                    />

                </div>

            </InfoCard>


            <InfoCard title="Receipt Summary">

                <div className="receipt-summary">

                    <div className="summary-row">
                        <span>Accommodation</span>
                        <strong>₹ {booking?.AccommodationAmount || 0}</strong>
                    </div>

                    {/* <div className="summary-row">
                        <span>Meal Charges</span>
                        <strong>₹ {mealCharges}</strong>
                    </div> */}

                    <div className="summary-row">
                        <span>Additional Charges</span>
                        <strong>₹ {additionalCharges}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Discount</span>
                        <strong>- ₹ {discount}</strong>
                    </div>

                    <div className="summary-total">

                        Total Payable

                        <strong>

                            ₹ {totalPayableAmount}

                        </strong>

                    </div>

                </div>

            </InfoCard>


            <div className="checkin-footer">

                <Button
                    onClick={onSubmit}
                >
                    Generate Receipt & Check-Out
                </Button>

            </div>

        </div>

    );

}

export default CheckOutPanel;