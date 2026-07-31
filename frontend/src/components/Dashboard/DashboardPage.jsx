import DashboardCards from "./DashboardCards";
import DashboardTable from "./DashboardTable";
import "../Dashboard/dashboard.css";

function DashboardPage({
    title,
    subtitle,
    cards = [],
    applications = [],
    viewRoute,
    actions
}) {
    return (
        <div className="dashboard-container">

            <div className="dashboard-header">

                <div className="dashboard-header-content">

                    <h2 className="dashboard-title">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="dashboard-subtitle">
                            {subtitle}
                        </p>
                    )}

                </div>

                {actions && (
                    <div className="dashboard-actions">
                        {actions}
                    </div>
                )}

            </div>

            <DashboardCards cards={cards} />

            <div className="table-section">

                <DashboardTable
                    applications={applications}
                    viewRoute={viewRoute}
                />

            </div>

        </div>
    );
}

export default DashboardPage;