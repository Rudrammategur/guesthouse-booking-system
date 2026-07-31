import "./sectionHeader.css";

function SectionHeader({
    title,
    subtitle,
    actions
}) {
    return (
        <div className="section-header">
            <div className="section-header-content">
                <h3>{title}</h3>

                {subtitle && (
                    <p>{subtitle}</p>
                )}
            </div>

            {actions && (
                <div className="section-actions">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default SectionHeader;