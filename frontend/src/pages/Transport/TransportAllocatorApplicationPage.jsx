
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

import ERPPage from "../../components/Common/ERPPage";
import Button from "../../components/Common/Button/Button";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";

import TransportApplicationView from "../../components/Dashboard/TransportApplicationView/TransportApplicationView";

import TransportAllocationAction from "../../components/Workflow/TransportAllocationAction";


function TransportAllocatorApplicationPage() {

    const {
        transportBookingId
    } = useParams();


    const [application, setApplication] =
        useState(null);

    const [showAllocationModal, setShowAllocationModal] =
        useState(false);


    const fetchApplication = async () => {

        try {

            const response =
                await api.get(
                    `/api/transport-allocator/application/${transportBookingId}`
                );


            console.log(
                "Transport Allocator Application:",
                response.data
            );


            setApplication(
                response.data.data
            );

        }

        catch (err) {

            console.error(
                "Failed to fetch transport allocator application:",
                err
            );

        }

    };


    useEffect(() => {

        if (transportBookingId) {

            fetchApplication();

        }

    }, [transportBookingId]);


    if (!application) {

        return <h3>Loading...</h3>;

    }


    return (

        <ERPPage>

            <TransportApplicationView

                application={application}

                extraActions={

                    application.BookingStatus ===
                        "Approved" && (

                        <Button
                            onClick={() =>
                                setShowAllocationModal(
                                    true
                                )
                            }
                        >
                            Allocate Vehicle
                        </Button>

                    )

                }

            />


            <ERPFormModal

                open={showAllocationModal}

                title="Vehicle Allocation"

                showFooter={false}

                onClose={() =>
                    setShowAllocationModal(
                        false
                    )
                }

            >

                <TransportAllocationAction

                    application={application}

                    showHeader={false}

                    onSuccess={() => {

                        setShowAllocationModal(
                            false
                        );

                        fetchApplication();

                    }}

                />

            </ERPFormModal>


        </ERPPage>

    );

}


export default TransportAllocatorApplicationPage;

