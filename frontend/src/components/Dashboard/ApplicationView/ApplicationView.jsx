import { useState } from "react";

import WorkflowLogs from "../../Workflow/WorkflowLogs";

import ApplicationHeader from "./ApplicationHeader";
import ApplicationSummary from "./ApplicationSummary";
import ApplicationDetails from "./ApplicationDetails";

import "./ApplicationView.css";

function ApplicationView({ application, extraActions }) {

    const [activeTab, setActiveTab] = useState("application");

    console.log(application);

    if (!application) {
        return (
            <div className="application-empty">
                <h3>No Application Found</h3>
                <p>The requested guest house application could not be loaded.</p>
            </div>
        );
    }

    return (

        <div className="application-view">

            <ApplicationHeader
                application={application}
                extraActions={extraActions}
            />

            <ApplicationSummary
                application={application}
            />

            <div className="application-tabs-card">

                <div className="application-tabs">

                    <button
                        className={activeTab === "application" ? "active" : ""}
                        onClick={() => setActiveTab("application")}
                        aria-selected={activeTab === "application"}
                        role="tab"
                    >
                        Application Details
                    </button>

                    <button
                        className={activeTab === "logs" ? "active" : ""}
                        onClick={() => setActiveTab("logs")}
                        aria-selected={activeTab === "logs"}
                        role="tab"
                    >
                        Workflow Logs
                    </button>

                </div>

            </div>

            <div className="application-content-card">

                {
                    activeTab === "application"

                        ?

                        <ApplicationDetails
                            application={application}
                        />

                        :

                        <WorkflowLogs
                            moduleName="GuestHouse"
                            referenceId={application.GHBookingID}
                        />
                }

            </div>

        </div>

    );

}

export default ApplicationView;