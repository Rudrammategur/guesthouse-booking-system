import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import "../../styles/takeAction.css";

function TransportAllocationAction({
    application,
    onSuccess,
    showHeader = true
}) {

    const [decision, setDecision] =
        useState("Allocated");

    const [vehicleNumber, setVehicleNumber] =
        useState("");

    const [remarks, setRemarks] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    const handleDecisionChange = (event) => {

        const value =
            event.target.value;

        setDecision(value);

        if (value === "Vehicle Unavailable") {

            setVehicleNumber("");

        }

    };


    const handleSubmit = async () => {

        try {

            if (!application?.TransportBookingID) {

                toast.error(
                    "Transport booking ID is missing."
                );

                return;

            }


            if (decision === "Allocated") {

                if (!vehicleNumber.trim()) {

                    toast.error(
                        "Allocated vehicle is required."
                    );

                    return;

                }

            }


            if (
                decision ===
                "Vehicle Unavailable" &&
                !remarks.trim()
            ) {

                toast.error(
                    "Please enter remarks when the vehicle is unavailable."
                );

                return;

            }


            setSubmitting(true);


            const response =
                await api.put(

                    `/api/transport-allocator/allocate/${application.TransportBookingID}`,

                    {

                        decision,

                        vehicleNumber:
                            vehicleNumber.trim(),

                        remarks:
                            remarks.trim()

                    }

                );


            toast.success(
                response.data.message ||
                "Allocation decision submitted successfully."
            );


            onSuccess?.();

        }

        catch (err) {

            console.error(
                "Transport allocation error:",
                err
            );

            toast.error(

                err.response?.data?.message ||
                "Unable to submit allocation decision."

            );

        }

        finally {

            setSubmitting(false);

        }

    };


    return (

        <div className="action-card">

            {showHeader && (
                <h3>
                    Vehicle Allocation
                </h3>
            )}


            <div className="decision-section">

                <label>
                    Allocation Decision
                </label>


                <div className="radio-group">

                    <label>

                        <input
                            type="radio"
                            name="allocationDecision"
                            value="Allocated"
                            checked={
                                decision === "Allocated"
                            }
                            onChange={
                                handleDecisionChange
                            }
                        />

                        Vehicle Available

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="allocationDecision"
                            value="Vehicle Unavailable"
                            checked={
                                decision ===
                                "Vehicle Unavailable"
                            }
                            onChange={
                                handleDecisionChange
                            }
                        />

                        Vehicle Unavailable

                    </label>

                </div>

            </div>


            {decision === "Allocated" && (

                <div className="remarks-section">

                    <label>

                        Allocated Vehicle
                        <span className="required-mark">
                            {" "}*
                        </span>

                    </label>


                    <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) =>
                            setVehicleNumber(
                                e.target.value
                            )
                        }
                        placeholder="Enter vehicle number"
                    />

                </div>

            )}


            <div className="remarks-section">

                <label>
                    Remarks
                    {decision ===
                        "Vehicle Unavailable" && (
                        <span className="required-mark">
                            {" "}*
                        </span>
                    )}
                </label>


                <textarea
                    rows="5"
                    value={remarks}
                    onChange={(e) =>
                        setRemarks(
                            e.target.value
                        )
                    }
                    placeholder="Enter remarks"
                />

            </div>


            <button
                type="button"
                className="submit-btn"
                disabled={submitting}
                onClick={handleSubmit}
            >

                {submitting
                    ? "Submitting..."
                    : "Submit Allocation Decision"}

            </button>

        </div>

    );

}

export default TransportAllocationAction;

