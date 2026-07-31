import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import "../../styles/ghCheckIn.css";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button";
import ApplicationSummary from "../../components/Dashboard/ApplicationView/ApplicationSummary";
import InfoCard from "../../components/Common/InfoCard/InfoCard";
import { toast } from "react-toastify";
import ERPSelectField from "../../components/Common/Form/ERPSelectField";
import ERPFormField from "../../components/Common/Form/ERPFormField";
import ERPTextArea from "../../components/Common/Form/ERPTextArea";
import ERPPage from "../../components/Common/ERPPage";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";
import CheckInPanel from "./CheckInPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9009";


function GHCheckInPage() {

    const navigate = useNavigate();

    const { bookingId } = useParams();
    const [showCheckIn, setShowCheckIn] = useState(false);

    const addOccupant = () => {

        setOccupants(prev => [

            ...prev,

            {
                name: "",
                gender: "",
                age: "",
                relationship: "",
                proofType: "",
                proofNumber: "",
                proofFile: null
            }

        ]);

    };

    const handleOccupantChange = (index, field, value) => {

        const updated = [...occupants];

        updated[index][field] = value;

        setOccupants(updated);

    };

    const removeOccupant = (index) => {

        setOccupants(

            occupants.filter((_, i) => i !== index)

        );

    };

    const [application, setApplication] = useState({

        Allocations: [],

        RoomRequirements: []

    });

    useEffect(() => {

        loadApplication();

    }, []);

    const loadApplication = async () => {

        const res = await axios.get(

            `${API_URL}/api/gh-incharge/checkin/${bookingId}`

        );

        setApplication(res.data.data);

    };

    const [primaryGuest, setPrimaryGuest] = useState({
        proofType: "",
        proofNumber: "",
        document: null
    });

    const [occupants, setOccupants] = useState([
        {
            name: "",
            relationship: "",
            age: "",
            proofType: "",
            proofNumber: "",
            document: null
        }
    ]);

    const [remarks, setRemarks] = useState("");

    const [selectedOccupant, setSelectedOccupant] = useState(null);

    const [showDocumentModal, setShowDocumentModal] = useState(false);


    const [idProofType, setIdProofType] =
        useState("");

    const [idProofNo, setIdProofNo] =
        useState("");

    const handleCheckIn = async () => {

        try {

            const formData = new FormData();

            formData.append(
                "proofType",
                primaryGuest.proofType
            );

            formData.append(
                "proofNumber",
                primaryGuest.proofNumber
            );

            formData.append(
                "remarks",
                remarks
            );

            formData.append(
                "document",
                primaryGuest.document
            );

            formData.append(
                "occupants",
                JSON.stringify(occupants)
            );

            await axios.post(

                `${API_URL}/api/gh-incharge/checkin/${bookingId}`,

                formData,

                {

                    headers: {

                        "Content-Type": "multipart/form-data"

                    }

                }

            );

            toast.success("Guest checked in successfully.");

            navigate("/gh-incharge");

        }

        catch (err) {

            console.log(err);

            toast.error(

                err.response?.data?.message ||

                "Check-In failed."

            );

        }

    };

    const updateOccupant = (
        index,
        field,
        value
    ) => {

        const updatedOccupants =
            [...occupants];

        updatedOccupants[index][field] =
            value;

        setOccupants(updatedOccupants);

    };

    const proofTypes = [

        {
            label: "Aadhaar Card",
            value: "Aadhaar"
        },

        {
            label: "PAN Card",
            value: "PAN"
        },

        {
            label: "Passport",
            value: "Passport"
        },

        {
            label: "Driving Licence",
            value: "Driving Licence"
        },

        {
            label: "Voter ID",
            value: "Voter ID"
        },

        {
            label: "Any Government ID",
            value: "Any Government ID"
        }

    ];


    return (

                <ERPPage>

                    <ApplicationView
                        application={application}
                        extraActions={
                            <Button
                                onClick={() => setShowCheckIn(true)}
                            >
                                Check-In
                            </Button>
                        }
                    />

                    <ERPFormModal
                        open={showCheckIn}
                        title="Guest Check-In"
                        onClose={() => setShowCheckIn(false)}
                        showFooter={false}
                        size="lg"
                    >
                        <CheckInPanel
                            primaryGuest={primaryGuest}
                            setPrimaryGuest={setPrimaryGuest}
                            occupants={occupants}
                            setOccupants={setOccupants}
                            remarks={remarks}
                            setRemarks={setRemarks}
                            proofTypes={proofTypes}
                            onSubmit={handleCheckIn}
                        />
                    </ERPFormModal>

                </ERPPage>
    );
}

export default GHCheckInPage;