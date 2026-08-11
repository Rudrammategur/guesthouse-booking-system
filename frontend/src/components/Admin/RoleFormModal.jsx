import { useEffect, useState } from "react";
import api from "../../api/axios";

import ERPFormModal from "../Common/Form/ERPFormModal";
import ERPFormField from "../Common/Form/ERPFormField";
import api from "../../services/api";


function RoleFormModal({

    open,

    onClose,

    onSaved,

    selectedRole

}) {

    const [form, setForm] = useState({

        RoleName: "",

        Description: ""

    });

    useEffect(() => {

        if (selectedRole) {

            setForm({

                RoleName:

                    selectedRole.RoleName || "",

                Description:

                    selectedRole.Description || ""

            });

        }

        else {

            setForm({

                RoleName: "",

                Description: ""

            });

        }

    }, [selectedRole]);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async () => {

        if (!form.RoleName.trim()) {

            alert("Role Name is required.");

            return;

        }

        try {

            if (selectedRole) {

                await api.put(

                    `/api/admin/roles/${selectedRole.RoleID}`,

                    form

                );

            }

            else {

                await api.post(

                    `/api/admin/roles`,

                    form

                );

            }

            onSaved();

            onClose();

        }

        catch (err) {

            alert(

                err.response?.data?.message ||

                "Unable to save role."

            );

        }

    };

    return (

        <ERPFormModal

            open={open}

            title={

                selectedRole

                    ?

                    "Edit Role"

                    :

                    "Add Role"

            }

            onSave={handleSubmit}

            onClose={onClose}

        >

            <ERPFormField

                label="Role Name"

                required

                name="RoleName"

                value={form.RoleName}

                onChange={handleChange}

            />

            <ERPFormField

                label="Description"

                name="Description"

                value={form.Description}

                onChange={handleChange}

            />

        </ERPFormModal>

    );

}

export default RoleFormModal;