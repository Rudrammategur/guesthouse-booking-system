import { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../styles/takeAction.css";

function TakeAction({
    application,
    actionType,
    bookingId,
    verifyUrl,
    rejectUrl,
    redirectPath,
    onSuccess,
    showHeader = true
}) {

    const navigate = useNavigate();

    const approveText =
        actionType === "Approver"
            ? "Approve"
            : "Verify";

    const approveStatus =
        actionType === "Approver"
            ? "Approved"
            : "Verified";

    const [status, setStatus] =
        useState(approveStatus);

    const [remarks, setRemarks] =
        useState("");

    const handleSubmit = async () => {

        try {

            if (!bookingId) {

                toast.error(
                    "Booking ID is missing."
                );

                console.error(
                    "TakeAction: bookingId is missing",
                    application
                );

                return;
            }

            if (!verifyUrl || !rejectUrl) {

                toast.error(
                    "Workflow API configuration is missing."
                );

                console.error(
                    "TakeAction: verifyUrl/rejectUrl missing"
                );

                return;
            }

            const url =
                status === approveStatus
                    ? `${verifyUrl}/${bookingId}`
                    : `${rejectUrl}/${bookingId}`;

            console.log(
                "TakeAction URL:",
                url
            );

            const response =
                await api.put(
                    url,
                    {
                        remarks
                    }
                );

            toast.success(
                response.data.message
            );

            onSuccess?.();

            if (redirectPath) {

                setTimeout(() => {

                    navigate(
                        redirectPath
                    );

                }, 1000);

            }

        }

        catch (err) {
            console.error("TakeAction error:", err);
            console.error("Response data:", err.response?.data);
            console.error("Response status:", err.response?.status);
            console.error("Response headers:", err.response?.headers);

            toast.error(
                err.response?.data?.message ||
                "Something went wrong."
            );

        }

    };

    return (

        <div className="action-card">

            {showHeader && (
                <h3>
                    Take Action
                </h3>
            )}

            <div className="decision-section">

                <label>
                    Decision
                </label>

                <div className="radio-group">

                    <label>

                        <input
                            type="radio"
                            value={approveStatus}
                            checked={
                                status === approveStatus
                            }
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                        />

                        {approveText}

                    </label>

                    <label>

                        <input
                            type="radio"
                            value="Rejected"
                            checked={
                                status === "Rejected"
                            }
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                        />

                        Reject

                    </label>

                </div>

            </div>

            <div className="remarks-section">

                <label>
                    Remarks
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
                className="submit-btn"
                onClick={handleSubmit}
            >
                Submit
            </button>

        </div>

    );

}

export default TakeAction;