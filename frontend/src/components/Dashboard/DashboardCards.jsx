import "./dashboard.css";

function DashboardCards({ cards = [] }) {
    return (
        <div className="summary-grid">
            {cards.map((card) => (
                <button
                    key={card.label}
                    type="button"
                    className={`summary-card ${card.className || ""} ${
                        card.active ? "active" : ""
                    }`}
                    onClick={() => card.onClick?.()}
                    aria-pressed={card.active || false}
                    aria-label={`${card.label}: ${card.count}`}
                >
                    <div className="summary-card-content">
                        <h2>{card.count}</h2>
                        <p>{card.label}</p>
                    </div>

                    {card.icon && (
                        <div className="summary-card-icon">
                            {card.icon}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}

export default DashboardCards;