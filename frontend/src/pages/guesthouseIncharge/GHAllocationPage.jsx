import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ApplicationView from "../../components/Dashboard/ApplicationView/ApplicationView";
import RoomAllocationPanel from "./RoomAllocationPanel";
import RoomAvailabilityCalendar from "../../components/Common/RoomAvailabilityCalendar";
import ERPPage from "../../components/Common/ERPPage";
import PageHeader from "../../components/Common/PageHeader";
import Button from "../../components/Common/Button/Button";
import ERPFormModal from "../../components/Common/Form/ERPFormModal";

import "../../styles/workflowLayout.css";

const API_URL = import.meta.env.VITE_API_URL || "/guesthouse-api";

function GHAllocationPage() {
  const { bookingId, id } = useParams();
  const selectedBookingId = bookingId || id;
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGuestHouse, setSelectedGuestHouse] = useState("");
  const [guestHouses, setGuestHouses] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [accommodationAmount, setAccommodationAmount] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [occupancy, setOccupancy] = useState({});
  const [showAllocationModal, setShowAllocationModal] = useState(false);



  const loadAllocation = useCallback(async () => {
    setLoading(true);
    try {

      const [applicationResponse, roomResponse, occupancyResponse] = await Promise.all([

        axios.get(
          `${API_URL}/api/gh-incharge/applications/${selectedBookingId}`
        ),

        axios.get(
          `${API_URL}/api/gh-incharge/room-availability`
        ),

        axios.get(
          `${API_URL}/api/gh-incharge/occupancy-summary`
        )

      ]);

      setApplication(applicationResponse.data.data);

      setRoomAvailability(roomResponse.data.data);

      setOccupancy(occupancyResponse.data.data);

      if (applicationResponse.data.data.BookingStatus === "Approved") {
        const roomsResponse = await axios.get(
          `${API_URL}/api/gh-incharge/applications/${selectedBookingId}/available-rooms`
        );

        setRooms(roomsResponse.data.data);
      }

      const guestHouseResponse = await axios.get(
        `${API_URL}/api/master/guesthouse-types`
      );

      setGuestHouses(guestHouseResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load allocation details");
    } finally {
      setLoading(false);
    }

  }, [selectedBookingId]);

  useEffect(() => { loadAllocation(); }, [loadAllocation]);

  useEffect(() => {

    if (!application) return;

    const arrival = new Date(application.ArrivalDateTime);

    const departure = new Date(application.DepartureDateTime);

    const stayDays = Math.max(
      1,
      Math.ceil(
        (departure - arrival) /
        (1000 * 60 * 60 * 24)
      )
    );

    const total = selectedRooms.reduce(

      (sum, room) =>

        sum +

        (Number(room.dayRate || 0) * stayDays),

      0

    );

    setAccommodationAmount(total);

  }, [selectedRooms, application]);

  const allocateRooms = async () => {

    setSaving(true);

    try {

      await axios.post(

        `${API_URL}/api/gh-incharge/applications/${selectedBookingId}/allocations`,

        {

          rooms: selectedRooms,

          accommodationAmount,

          remarks

        }

      );

      toast.success("Rooms allocated successfully");

      navigate("/gh-incharge");

    }

    catch (err) {

      toast.error(

        err.response?.data?.message ||

        "Allocation failed"

      );

    }

    finally {

      setSaving(false);

    }

  };


  if (loading) return <div className="allocation-loading">Loading application…</div>;
  if (!application) return <div className="allocation-loading">Application not found.</div>;

  return (

    <ERPPage>

      <ApplicationView
        application={application}
        extraActions={
          <>
            <Button
              onClick={() => setShowCalendar(true)}
            >
              Room Availability
            </Button>

            <Button
              onClick={() => setShowAllocationModal(true)}
            >
              Allocate Rooms
            </Button>
          </>
        }
      />

      <>
        <ERPFormModal
          open={showAllocationModal}
          title="Allocate Rooms"
          onClose={() => setShowAllocationModal(false)}
          showFooter={false}
        >
          <RoomAllocationPanel
            application={application}
            rooms={rooms}
            selectedRooms={selectedRooms}
            onSelectionChange={setSelectedRooms}
            onAllocate={allocateRooms}
            saving={saving}
            selectedGuestHouse={selectedGuestHouse}
            setSelectedGuestHouse={setSelectedGuestHouse}
            accommodationAmount={accommodationAmount}
            remarks={remarks}
            setRemarks={setRemarks}
            onSuccess={() => {
              setShowAllocationModal(false);
              navigate("/gh-incharge");
            }}
          />
        </ERPFormModal>

        <ERPFormModal
          open={showCalendar}
          title="Room Availability"
          onClose={() => setShowCalendar(false)}
          showFooter={false}
          size="xl"
        >
          <RoomAvailabilityCalendar
            rooms={roomAvailability}
            occupancy={occupancy}
          />
        </ERPFormModal>
      </>
    </ERPPage>

  );
}

export default GHAllocationPage;
