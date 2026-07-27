
import { useNavigate } from "react-router-dom";

import PageHeader from "../../Common/PageHeader";
import Button from "../../Common/Button/Button";
import StatusBadge from "../../Common/StatusBadge";

import "./ApplicationView.css";

function ApplicationHeader({ application }) {

    const navigate = useNavigate();

    const handlePrint = () => {

    navigate(

        `/print/${application.GHBookingID}`

    );

};

    return (

        <PageHeader

            title="Guest House Application"

            subtitle={

                <div className="application-header-info">

                    <span>

                        <strong>Booking No :</strong>

                        {application.GHRBookingNo}

                    </span>

                    <span>

                        <strong>Submitted :</strong>

                        {new Date(

                            application.BookingDateTime

                        ).toLocaleString("en-IN")}

                    </span>

                </div>

            }

            actions={

                <div className="application-header-actions">

                    <StatusBadge

                        status={application.BookingStatus}

                    />

                    <Button

                        variant="outline"

                        onClick={() => navigate(-1)}

                    >

                        ← Back

                    </Button>

                    <Button

                        onClick={handlePrint}

                    >

                        🖨 Print

                    </Button>

                </div>

            }

        />

    );

}

export default ApplicationHeader;

// import { useNavigate } from "react-router-dom";

// import PageHeader from "../../Common/PageHeader";
// import Button from "../../Common/Button/Button";
// import StatusBadge from "../../Common/StatusBadge";

// import logo from "../../../assets/iitdh-logo.png";

// import "./ApplicationHeader.css";

// function ApplicationHeader({ application }) {

//     console.log("ApplicationHeader Loaded");

//     const navigate = useNavigate();

//     return (

//         <header className="application-hero">

//             <div className="application-top-actions">

//                 <Button
//                     variant="outline"
//                     onClick={() => navigate(-1)}
//                 >
//                     ← Back
//                 </Button>

//                 <Button
//                     onClick={() =>
//                         navigate(`/guesthouse/print/${application.GHBookingID}`)
//                     }
//                 >
//                     🖨 Print
//                 </Button>

//             </div>

//             <div className="application-hero-content">

//                 <div className="application-brand">

//                     <img
//                         src={logo}
//                         alt="IIT Dharwad"
//                     />

//                     <div>

//                         <span className="hero-kicker">

//                             Guest House Booking

//                         </span>

//                         <h1>

//                             Indian Institute of Technology Dharwad

//                         </h1>

//                         <p>

//                             Booking No :
//                             <strong>

//                                 {application.GHRBookingNo}

//                             </strong>

//                         </p>

//                     </div>

//                 </div>

//                 <div className="application-status">

//                     <span>

//                         Current Status

//                     </span>

//                     <StatusBadge
//                         status={application.BookingStatus}
//                     />

//                 </div>

//             </div>

//         </header>

//     );

// }

// export default ApplicationHeader;