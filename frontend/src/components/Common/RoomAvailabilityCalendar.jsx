import { useMemo, useState } from "react";
import "../../styles/roomCalendar.css";

function RoomAvailabilityCalendar({

    rooms = [],
    occupancy = {},
    months = 6,
    title = "Room Availability"

}) {

    const today = new Date();

    const firstMonth = new Date(

        today.getFullYear(),
        today.getMonth(),
        1

    );

    /* -------------------------------------------------------
       Available Months (Current + Next 5 Months)
    ------------------------------------------------------- */

    const monthList = [];

    for (let i = 0; i < months; i++) {

        monthList.push(

            new Date(
                firstMonth.getFullYear(),
                firstMonth.getMonth() + i,
                1
            )

        );

    }

    const [selectedMonth, setSelectedMonth] = useState(firstMonth);

    const [search, setSearch] = useState("");

    const [roomType, setRoomType] = useState("All");

    const currentIndex = monthList.findIndex(

        month =>

            month.getMonth() === selectedMonth.getMonth()

            &&

            month.getFullYear() === selectedMonth.getFullYear()

    );

    /* -------------------------------------------------------
       Days in Month
    ------------------------------------------------------- */

    const days = useMemo(() => {

        const totalDays = new Date(

            selectedMonth.getFullYear(),
            selectedMonth.getMonth() + 1,
            0

        ).getDate();

        return Array.from(

            { length: totalDays },

            (_, index) =>

                new Date(

                    selectedMonth.getFullYear(),
                    selectedMonth.getMonth(),
                    index + 1

                )

        );

    }, [selectedMonth]);

    /* -------------------------------------------------------
       Room Types
    ------------------------------------------------------- */

    const roomTypes = [

        "All",

        ...new Set(

            rooms.map(room => room.RoomType)

        )

    ];

    /* -------------------------------------------------------
       Filter Rooms
    ------------------------------------------------------- */

    const filteredRooms = rooms.filter(room => {

        const matchesSearch =

            room.RoomNo

                .toString()

                .toLowerCase()

                .includes(search.toLowerCase());

        const matchesType =

            roomType === "All"

            ||

            room.RoomType === roomType;

        return matchesSearch && matchesType;

    });

    /* -------------------------------------------------------
       Occupancy
    ------------------------------------------------------- */

    const getBooking = (room, day) => {

        return room.Bookings.find(booking => {

            const arrival = new Date(booking.ArrivalDateTime);

            const departure = new Date(booking.DepartureDateTime);

            arrival.setHours(0, 0, 0, 0);

            departure.setHours(23, 59, 59, 999);

            return day >= arrival && day <= departure;

        });

    };

    const isOccupied = (room, day) => !!getBooking(room, day);

    /* -------------------------------------------------------
       Navigation
    ------------------------------------------------------- */

    const previousMonth = () => {

        if (currentIndex > 0) {

            setSelectedMonth(

                monthList[currentIndex - 1]

            );

        }

    };

    const nextMonth = () => {

        if (currentIndex < monthList.length - 1) {

            setSelectedMonth(

                monthList[currentIndex + 1]

            );

        }

    };

    return (

    <div className="room-calendar">

        {/* ================= Header ================= */}

        <div className="calendar-header">

            <div>

                <h2>{title}</h2>

                <p>
                    View room availability from the current month for the next 6 months.
                </p>

            </div>

            <div className="calendar-navigation">

                <button
                    onClick={previousMonth}
                    disabled={currentIndex === 0}
                >
                    ◀
                </button>

                <span>

                    {selectedMonth.toLocaleDateString(

                        "en-IN",

                        {
                            month: "long",
                            year: "numeric"
                        }

                    )}

                </span>

                <button
                    onClick={nextMonth}
                    disabled={currentIndex === monthList.length - 1}
                >
                    ▶
                </button>

            </div>

        </div>

        {/* ================= Summary ================= */}

        <div className="calendar-summary">

            <div className="summary-card">

                <span>Total Rooms</span>

                <h3>{occupancy.TotalRooms ?? rooms.length}</h3>

            </div>

            <div className="summary-card">

                <span>Available</span>

                <h3>{occupancy.AvailableRooms ?? 0}</h3>

            </div>

            <div className="summary-card">

                <span>Occupied</span>

                <h3>{occupancy.OccupiedRooms ?? 0}</h3>

            </div>

        </div>

        {/* ================= Filters ================= */}

        <div className="calendar-toolbar">

            <input

                type="text"

                placeholder="Search Room Number"

                value={search}

                onChange={(e) =>

                    setSearch(e.target.value)

                }

            />

            <select

                value={roomType}

                onChange={(e) =>

                    setRoomType(e.target.value)

                }

            >

                {

                    roomTypes.map(type => (

                        <option

                            key={type}

                            value={type}

                        >

                            {type}

                        </option>

                    ))

                }

            </select>

        </div>

        {/* ================= Legend ================= */}

        <div className="calendar-legend">

            <div className="legend-item">

                <span className="legend-box available-box"></span>

                Available

            </div>

            <div className="legend-item">

                <span className="legend-box occupied-box"></span>

                Occupied

            </div>

        </div>

        {/* ================= Month Tabs ================= */}

        <div className="month-tabs">

            {

                monthList.map(month => (

                    <button

                        key={month.toISOString()}

                        className={

                            month.getMonth() === selectedMonth.getMonth()

                            &&

                            month.getFullYear() === selectedMonth.getFullYear()

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            setSelectedMonth(month)

                        }

                    >

                        {

                            month.toLocaleDateString(

                                "en-IN",

                                {

                                    month: "short"

                                }

                            )

                        }

                    </button>

                ))

            }

        </div>

        {/* ================= Calendar ================= */}

        <div className="calendar-table-wrapper">

            <table className="calendar-table">

                <thead>

                    <tr>

                        <th className="sticky-column">

                            Room

                        </th>

                        <th className="sticky-type">

                            Type

                        </th>

                        {

                            days.map(day => (

                                <th
                                    key={day.toISOString()}
                                >

                                    <div>

                                        {

                                            day.getDate()

                                        }

                                    </div>

                                    <small>

                                        {

                                            day.toLocaleDateString(

                                                "en-IN",

                                                {

                                                    weekday: "short"

                                                }

                                            )

                                        }

                                    </small>

                                </th>

                            ))

                        }

                    </tr>

                </thead>

                <tbody>

                    {

                        filteredRooms.map(room => (

                            <tr key={room.RoomID}>

                                <td className="sticky-column room-number">

                                    {room.RoomNo}

                                </td>

                                <td className="sticky-type room-type">

                                    {room.RoomType}

                                </td>

                                {

                                    days.map(day => {

                                        const booking =

                                            getBooking(

                                                room,

                                                day

                                            );

                                        const occupied = !!booking;

                                        return (

                                            <td

                                                key={day.toISOString()}

                                                className={

                                                    occupied

                                                        ? "occupied"

                                                        : "available"

                                                }

                                                title={

                                                    occupied

                                                        ?

`${booking.GuestName}

${new Date(booking.ArrivalDateTime).toLocaleDateString("en-IN")}

-

${new Date(booking.DepartureDateTime).toLocaleDateString("en-IN")}

${booking.Status}`

                                                        :

"Available"

                                                }

                                            >

                                                {

                                                    occupied

                                                        ?

<div className="booking-dot"></div>

                                                        :

null

                                                }

                                            </td>

                                        );

                                    })

                                }

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    </div>

);

}

export default RoomAvailabilityCalendar;