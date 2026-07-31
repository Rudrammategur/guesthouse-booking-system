import InfoCard from "../../components/Common/InfoCard/InfoCard";
import ERPSelectField from "../../components/Common/Form/ERPSelectField";
import ERPFormField from "../../components/Common/Form/ERPFormField";
import ERPTextArea from "../../components/Common/Form/ERPTextArea";
import Button from "../../components/Common/Button/Button";

function CheckInPanel({

    primaryGuest,
    setPrimaryGuest,

    occupants,
    setOccupants,

    remarks,
    setRemarks,

    proofTypes,

    onSubmit

}) {

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

    const removeOccupant = (index) => {

        setOccupants(

            occupants.filter((_, i) => i !== index)

        );

    };

    const handleOccupantChange = (index, field, value) => {

        const updated = [...occupants];

        updated[index][field] = value;

        setOccupants(updated);

    };

    return (

        <div className="checkin-panel">

            {/* Primary Guest */}

            <InfoCard title="Primary Guest Verification">

                <div className="occupant-grid">

                    <ERPSelectField

                        label="ID Proof Type"

                        value={primaryGuest.proofType}

                        options={proofTypes}

                        onChange={(e) =>

                            setPrimaryGuest({

                                ...primaryGuest,

                                proofType: e.target.value

                            })

                        }

                    />

                    <ERPFormField

                        label="ID Proof Number"

                        value={primaryGuest.proofNumber}

                        onChange={(e) =>

                            setPrimaryGuest({

                                ...primaryGuest,

                                proofNumber: e.target.value

                            })

                        }

                    />

                    <div className="full-width">

                        <label>Upload ID Proof</label>

                        <input

                            type="file"

                            onChange={(e) =>

                                setPrimaryGuest({

                                    ...primaryGuest,

                                    document: e.target.files[0]

                                })

                            }

                        />

                    </div>

                    {/* Occupants */}

                </div>

            </InfoCard>

            <InfoCard title="Additional Occupants">

                <div className="section-header">

                    <h4>Additional Occupants</h4>

                    <Button onClick={addOccupant}>
                        + Add Occupant
                    </Button>

                </div>

                {

                    occupants.map((occupant, index) => (

                        <div

                            key={index}

                            className="occupant-card"

                        >

                            <div className="occupant-header">

                                <h4>

                                    Occupant {index + 1}

                                </h4>

                                {

                                    occupants.length > 1 && (

                                        <Button

                                            variant="danger"

                                            onClick={() =>

                                                removeOccupant(index)

                                            }

                                        >

                                            Remove

                                        </Button>

                                    )

                                }

                            </div>

                            <div className="occupant-grid">

                                <ERPFormField

                                    label="Name"

                                    value={occupant.name}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "name",

                                            e.target.value

                                        )

                                    }

                                />

                                <ERPSelectField

                                    label="Gender"

                                    value={occupant.gender}

                                    options={[

                                        {

                                            label: "Male",

                                            value: "Male"

                                        },

                                        {

                                            label: "Female",

                                            value: "Female"

                                        },

                                        {

                                            label: "Other",

                                            value: "Other"

                                        }

                                    ]}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "gender",

                                            e.target.value

                                        )

                                    }

                                />

                                <ERPFormField

                                    label="Age"

                                    value={occupant.age}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "age",

                                            e.target.value

                                        )

                                    }

                                />

                                <ERPFormField

                                    label="Relationship"

                                    value={occupant.relationship}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "relationship",

                                            e.target.value

                                        )

                                    }

                                />

                                <ERPSelectField

                                    label="ID Proof Type"

                                    value={occupant.proofType}

                                    options={proofTypes}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "proofType",

                                            e.target.value

                                        )

                                    }

                                />

                                <ERPFormField

                                    label="ID Proof Number"

                                    value={occupant.proofNumber}

                                    onChange={(e) =>

                                        handleOccupantChange(

                                            index,

                                            "proofNumber",

                                            e.target.value

                                        )

                                    }

                                />

                                <div className="full-width">

                                    <label>

                                        Upload ID Proof

                                    </label>

                                    <input

                                        type="file"

                                        onChange={(e) =>

                                            handleOccupantChange(

                                                index,

                                                "proofFile",

                                                e.target.files[0]

                                            )

                                        }

                                    />

                                </div>

                            </div>

                        </div>

                    ))

                }

            </InfoCard>



            {/* Remarks */}

            <InfoCard title="Remarks">

                <ERPTextArea

                    label="Remarks"

                    rows={4}

                    value={remarks}

                    onChange={(e) =>

                        setRemarks(

                            e.target.value

                        )

                    }

                />

            </InfoCard>


            {/* Footer */}

            <div className="checkin-footer">

                <Button

                    onClick={onSubmit}

                >

                    Confirm Check-In

                </Button>

            </div>

        </div>

    );

}

export default CheckInPanel;