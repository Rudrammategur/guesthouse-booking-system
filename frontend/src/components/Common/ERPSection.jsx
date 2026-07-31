import "../Common/section.css";

function ERPSection({

    title,

    actions,

    children,

    className = ""

}) {

    return (

        <section className={`erp-section ${className}`}>

            {(title || actions) && (

                <div className="erp-section-header">

                    {title &&

                        <h2 className="erp-section-title">

                            {title}

                        </h2>

                    }

                    {actions && (

                        <div className="erp-section-actions">

                            {actions}

                        </div>

                    )}

                </div>

            )}

            <div className="erp-section-body">

                {children}

            </div>

        </section>

    );

}

export default ERPSection;