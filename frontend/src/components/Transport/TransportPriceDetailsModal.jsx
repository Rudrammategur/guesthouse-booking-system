import "./TransportPriceDetailsModal.css";

function TransportPriceDetailsModal({
    open,
    onClose
}) {

    if (!open) {
        return null;
    }

    const vehicleRates = [
        {
            category:
                "Toyota Etios / Maruti Ciaz / Swift Dzire / Honda Amaze and equivalent class of sedan cars (4+1 seat) with AC",
            fourHours: 1610,
            eightHours: 2366,
            twelveHours: 3500,
            extraHour: 117,
            extraKm: 10.8,
            driverBhatta: 376
        },
        {
            category:
                "Tempo Traveller / Force Winger (12 Seat) & Equivalent",
            fourHours: 2690,
            eightHours: 3587,
            twelveHours: 5304,
            extraHour: 252,
            extraKm: 17.29,
            driverBhatta: 430
        },
        {
            category:
                "Innova Crysta & equivalent class",
            fourHours: 1988,
            eightHours: 2744,
            twelveHours: 4894,
            extraHour: 198,
            extraKm: 16.28,
            driverBhatta: 376
        },
        {
            category:
                "Bus (40 - 45 seat)",
            fourHours: 10049,
            eightHours: 12059,
            twelveHours: 15074,
            extraHour: 474,
            extraKm: 50.25,
            driverBhatta: 750
        },
        {
            category:
                "Bus (50 - 55 seat)",
            fourHours: 12134,
            eightHours: 14069,
            twelveHours: 17084,
            extraHour: 554,
            extraKm: 55.28,
            driverBhatta: 950
        }
    ];

    const travelPackages = [
        {
            packageName:
                "To & From Hubli Airport to IIT Dharwad Campus",
            sedan: 1124,
            innova: 1447,
            tempo: 2431,
            bus: 12018
        },
        {
            packageName:
                "To & From Hubli Railway Station to IIT Dharwad Campus",
            sedan: 1124,
            innova: 1447,
            tempo: 2431,
            bus: 12018
        },
        {
            packageName:
                "To & From Dharwad Railway Station to IIT Dharwad Campus",
            sedan: 854,
            innova: 1237,
            tempo: 1967,
            bus: 9889
        },
        {
            packageName:
                "To & From Belgaum Airport to IIT Dharwad",
            sedan: 2583,
            innova: 4527,
            tempo: 5456,
            bus: 15934
        },
        {
            packageName:
                "To & From Dharwad Bus Stand to IIT Dharwad",
            sedan: 854,
            innova: 1237,
            tempo: 1967,
            bus: 9889
        },
        {
            packageName:
                "To & From Goa Airport to IIT Dharwad",
            sedan: 4523,
            innova: 5608,
            tempo: 8040,
            bus: 21336
        }
    ];


    const formatAmount = (value) => {

        return `₹${Number(value).toLocaleString("en-IN")}`;

    };


    return (

        <div
            className="transport-rate-modal-overlay"
            onClick={onClose}
        >

            <div
                className="transport-rate-modal"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* Header */}

                <div className="transport-rate-modal-header">

                    <div>

                        <h2>
                            Transport Price Details
                        </h2>

                        <p>
                            Revised Rates for Hiring Vehicles
                            at IIT Dharwad
                        </p>

                        <span>
                            Effective from 01/07/2026
                        </span>

                    </div>


                    <button
                        type="button"
                        className="transport-rate-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                {/* Content */}

                <div className="transport-rate-modal-body">

                    {/* Table 1 */}

                    <section className="transport-rate-section">

                        <h3>
                            Table 1 — Vehicle Hiring Rates
                        </h3>

                        <div className="transport-rate-table-wrapper">

                            <table className="transport-rate-table">

                                <thead>

                                    <tr>

                                        <th rowSpan="2">
                                            Sl. No.
                                        </th>

                                        <th rowSpan="2">
                                            Category of Vehicle
                                        </th>

                                        <th colSpan="1">
                                            4 hrs. & 80 km
                                        </th>

                                        <th>
                                            8 hrs. & 150 km
                                        </th>

                                        <th>
                                            12 hrs. & 300 km
                                        </th>

                                        <th>
                                            Per Extra Hour
                                        </th>

                                        <th>
                                            Per Extra KM
                                        </th>

                                        <th>
                                            Driver Bhatta
                                            <br />
                                            (Outstation)
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {vehicleRates.map(
                                        (rate, index) => (

                                            <tr
                                                key={
                                                    rate.category
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td className="vehicle-category">
                                                    {rate.category}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        rate.fourHours
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        rate.eightHours
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        rate.twelveHours
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        rate.extraHour
                                                    )}
                                                </td>

                                                <td>
                                                    ₹
                                                    {Number(
                                                        rate.extraKm
                                                    ).toFixed(2)}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        rate.driverBhatta
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    {/* Table 2 */}

                    <section className="transport-rate-section">

                        <h3>
                            Table 2 — Travel Package Rates
                        </h3>

                        <div className="transport-rate-table-wrapper">

                            <table className="transport-rate-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Sl. No.
                                        </th>

                                        <th>
                                            Travel Package
                                        </th>

                                        <th>
                                            Toyota Etios /
                                            Maruti Ciaz /
                                            Honda Amaze /
                                            Swift Dzire
                                            <br />
                                            & Equivalent
                                        </th>

                                        <th>
                                            Innova Crysta /
                                            Scorpio /
                                            Tata Safari
                                            <br />
                                            & Equivalent
                                        </th>

                                        <th>
                                            Tempo Traveller /
                                            Force Winger
                                            <br />
                                            (12 Seat)
                                        </th>

                                        <th>
                                            Bus
                                            <br />
                                            (40 seat)
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {travelPackages.map(
                                        (item, index) => (

                                            <tr
                                                key={
                                                    item.packageName
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td className="travel-package">
                                                    {item.packageName}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        item.sedan
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        item.innova
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        item.tempo
                                                    )}
                                                </td>

                                                <td>
                                                    {formatAmount(
                                                        item.bus
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>


                    <div className="transport-rate-note">

                        <strong>
                            Note:
                        </strong>

                        Rates shown are exclusive of GST.

                    </div>

                </div>


                {/* Footer */}

                <div className="transport-rate-modal-footer">

                    <button
                        type="button"
                        className="transport-rate-close-action"
                        onClick={onClose}
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}

export default TransportPriceDetailsModal;