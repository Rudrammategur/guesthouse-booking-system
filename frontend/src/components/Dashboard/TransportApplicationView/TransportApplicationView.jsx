import { useState } from "react";

import WorkflowLogs from "../../Workflow/WorkflowLogs";

import TransportApplicationHeader from "./TransportApplicationHeader";
import TransportApplicationSummary from "./TransportApplicationSummary";
import TransportApplicationDetails from "./TransportApplicationDetails";

import "../ApplicationView/ApplicationView.css";

function TransportApplicationView({
    application,
    extraActions
}) {

    const [activeTab, setActiveTab] =
        useState("application");

    console.log("Transport Application:", application);

    if (!application) {

        return (

            <div className="application-empty">

                <h3>No Application Found</h3>

                <p>
                    The requested transport application
                    could not be loaded.
                </p>

            </div>

        );

    }

    return (

        <div className="application-view">

            {/* HEADER */}

            <TransportApplicationHeader
                application={application}
                extraActions={extraActions}
            />


            {/* SUMMARY */}

            <TransportApplicationSummary
                application={application}
            />


            {/* TABS */}

            <div className="application-tabs-card">

                <div className="application-tabs">

                    <button
                        className={
                            activeTab === "application"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("application")
                        }
                        aria-selected={
                            activeTab === "application"
                        }
                        role="tab"
                    >

                        Application Details

                    </button>


                    <button
                        className={
                            activeTab === "logs"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("logs")
                        }
                        aria-selected={
                            activeTab === "logs"
                        }
                        role="tab"
                    >

                        Workflow Logs

                    </button>

                </div>

            </div>


            {/* CONTENT */}

            <div className="application-content-card">

                {
                    activeTab === "application"

                        ?

                        <TransportApplicationDetails
                            application={application}
                        />

                        :

                        <WorkflowLogs
                            moduleName="Transport"
                            referenceId={
                                application.TransportBookingID
                            }
                        />

                }

            </div>

        </div>

    );

}

export default TransportApplicationView;