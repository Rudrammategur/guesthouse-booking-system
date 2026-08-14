const sql = require("mssql");
const { poolPromise } = require("../config/db");

/*
---------------------------------------------------------
Booking Notification Data
---------------------------------------------------------
Returns complete booking details required for:
✓ Email Notifications
✓ PDF Receipts
✓ Workflow
✓ Booking Details
---------------------------------------------------------
*/

exports.getBookingNotificationData = async (bookingId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "BookingID",
            sql.VarChar,
            bookingId
        )

        .query(`

SELECT

    B.GHBookingID,
    B.GHRBookingNo,
    B.BookingStatus,

    B.BookedBy,

    B.GuestName,
    B.GuestDesignation,
    B.GuestNationality,
    B.GuestContactNo,
    B.GuestEmailID,

    B.PurposeOfVisit,

    B.ArrivalDateTime,
    B.DepartureDateTime,

    B.TotalRoomsReq,
    B.OccupantsNo,

    GT.GuestTypeName,

    GH.GuestHouseName,
    R.GHRoomNo,
    RT.RoomTypeName,

    Applicant.EmployeeID,
    Applicant.EmployeeName,
    Applicant.EmployeeEmail,

    Verifier.EmployeeID AS VerifierID,
    Verifier.EmployeeName AS VerifierName,
    Verifier.EmployeeEmail AS VerifierEmail,

    Approver.EmployeeID AS ApproverID,
    Approver.EmployeeName AS ApproverName,
    Approver.EmployeeEmail AS ApproverEmail,

    Allocator.EmployeeID AS AllocatorID,
    Allocator.EmployeeName AS AllocatorName,
    Allocator.EmployeeEmail AS AllocatorEmail

FROM GuestHouseRoomBookings B

LEFT JOIN GuestTypeMaster GT
ON GT.GuestTypeID = B.GuestTypeID

LEFT JOIN GuestHouseMaster GH
ON GH.GuestHouseID = B.GuestHouseID

LEFT JOIN EmployeeMaster Applicant
ON Applicant.EmployeeID = B.BookedBy

LEFT JOIN EmployeeMaster Verifier
ON Verifier.EmployeeID = B.AssignedVerifierID

LEFT JOIN EmployeeMaster Approver
ON Approver.EmployeeID = B.AssignedApproverID

LEFT JOIN EmployeeMaster Allocator
ON Allocator.EmployeeID = B.AssignedAllocatorID

LEFT JOIN GuestHouseRoomAllocation RA
ON RA.GHBookingID = B.GHBookingID
AND RA.IsActive = 1

LEFT JOIN GuestHouseRooms R
ON R.GuestHouseRoomID = RA.GuestHouseRoomID

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = R.RoomTypeID

WHERE

B.GHBookingID=@BookingID

        `);

    if (result.recordset.length === 0) {

        return null;

    }

    return result.recordset[0];

};


exports.getBookingDetails = async (bookingId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "BookingID",
            sql.VarChar,
            bookingId
        )

        .query(`

SELECT

    b.*,

    gt.GuestTypeName,

    gh.GuestHouseName

FROM GuestHouseRoomBookings b

LEFT JOIN GuestTypeMaster gt
ON gt.GuestTypeID = b.GuestTypeID

LEFT JOIN GuestHouseMaster gh
ON gh.GuestHouseID = b.GuestHouseID

WHERE

    b.GHBookingID = @BookingID

    AND b.IsActive = 1

`);

    if (result.recordset.length === 0) {

        return null;

    }

    return result.recordset[0];

};

exports.getTransportBookingDetails = async (bookingId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "BookingID",
            sql.VarChar,
            bookingId
        )

        .query(`

            SELECT

                b.*,

                ebi.DisplayName AS ApplicantName

            FROM TransportBookings b

            LEFT JOIN HR..EmployeeBasicInfo ebi
                ON ebi.EmployeeId = b.BookedBy

            WHERE

                b.TransportBookingID = @BookingID

                AND b.IsActive = 1

        `);

    if (result.recordset.length === 0) {

        return null;

    }

    return result.recordset[0];

};