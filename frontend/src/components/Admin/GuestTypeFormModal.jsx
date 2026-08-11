import { useEffect, useState } from "react";
import api from "../../api/axios";

import ERPFormModal from "../Common/Form/ERPFormModal";
import ERPFormField from "../Common/Form/ERPFormField";


function GuestTypeFormModal({

    open,

    onClose,

    onSaved,

    selectedGuestType

}) {

    const [form, setForm] = useState({

        GuestTypeName: ""

    });

    useEffect(() => {

        if (selectedGuestType) {

            setForm({

                GuestTypeName:

                    selectedGuestType.GuestTypeName || ""

            });

        }

        else {

            setForm({

                GuestTypeName: ""

            });

        }

    }, [selectedGuestType]);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async () => {

        if (selectedGuestType) {

            await api.put(

                `/api/admin/guest-types/${selectedGuestType.GuestTypeID}`,

                form

            );

        }

        else {

            await api.post(

                `/api/admin/guest-types`,

                form

            );

        }

        onSaved();

        onClose();

    };

    return (

        <ERPFormModal

            open={open}

            title={

                selectedGuestType

                    ?

                    "Edit Guest Type"

                    :

                    "Add Guest Type"

            }

            onSave={handleSubmit}

            onClose={onClose}

        >

            <ERPFormField

                label="Guest Type Name"

                required

                name="GuestTypeName"

                value={form.GuestTypeName}

                onChange={handleChange}

            />

        </ERPFormModal>

    );

}

export default GuestTypeFormModal;