import { FaArrowLeft } from "react-icons/fa";
import "./pageHeader.css";

function PageHeader({

    title,

    subtitle,

    description,

    logo,

    hero = false,

    breadcrumbs = [],

    badge,

    actions,

    onBack,

    showBack = false

}) {

    return (

        <header
            className={`erp-page-header ${hero ? "hero-header" : ""
                }`}
        >

            <div className="erp-page-header-left">

                {

                    logo &&

                    <div className="hero-logo">

                        <img
                            src={logo}
                            alt="IIT Dharwad Logo"
                            loading="lazy"
                        />

                    </div>

                }

                {

                    showBack && (

                        <button
                            type="button"
                            className="erp-back-btn"
                            onClick={onBack}
                            aria-label="Go Back"
                        >
                            <FaArrowLeft />
                        </button>

                    )

                }

                <div>

                    {

                        breadcrumbs.length > 0 && (

                            <div className="erp-breadcrumb">

                                {

                                    breadcrumbs.map((item, index) => (

                                        <span key={index}>

                                            {item}

                                            {

                                                index !== breadcrumbs.length - 1

                                                &&

                                                " / "

                                            }

                                        </span>

                                    ))

                                }

                            </div>

                        )

                    }

                    <h1>

                        {title}

                    </h1>

                    {

                        subtitle &&

                        <h3 className="erp-page-subtitle">

                            {subtitle}

                        </h3>

                    }

                    {

                        description &&

                        <p className=".erp-page-description">

                            {description}

                        </p>

                    }

                </div>

            </div>

            {

                actions &&

                <div className="erp-page-header-right">

                    {actions}

                </div>

            }

        </header>

    );

}

export default PageHeader;