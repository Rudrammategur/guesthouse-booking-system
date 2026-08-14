import StatCard from "../../Common/StatCard/StatCard";

import "../ApplicationView/ApplicationView.css";

function TransportApplicationSummary({ application }) {

    const departure =
        application?.DepartureDateTime
            ? new Date(application.DepartureDateTime)
            : null;

    const arrival =
        application?.ArrivalDateTime
            ? new Date(application.ArrivalDateTime)
            : null;

    const journeyDays =
        departure && arrival
            ? Math.max(
                1,
                Math.ceil(
                    (arrival - departure) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 0;

    return (

        <div className="application-summary">

            {/* Status */}

            <StatCard
                title="Status"
                value={
                    application.BookingStatus || "-"
                }
                color="primary"
            />


            {/* Traveller */}

            <StatCard
                title="Traveller"
                value={
                    application.TravellerName || "-"
                }
                subtitle={
                    `${application.NumberOfTravellers || 0} Traveller(s)`
                }
                color="info"
            />


            {/* Journey Duration */}

            <StatCard
                title="Journey Duration"
                value={
                    journeyDays
                        ? `${journeyDays} Day${journeyDays > 1 ? "s" : ""}`
                        : "-"
                }
                subtitle={
                    departure && arrival
                        ? `${departure.toLocaleDateString("en-IN")} to ${arrival.toLocaleDateString("en-IN")}`
                        : "-"
                }
                color="warning"
            />


            {/* Seating Capacity */}

            <StatCard
                title="Seating Capacity"
                value={
                    application.SeatingCapacity || "-"
                }
                subtitle={
                    `${application.NumberOfTravellers || 0} Traveller(s)`
                }
                color="success"
            />

        </div>

    );

}

export default TransportApplicationSummary;