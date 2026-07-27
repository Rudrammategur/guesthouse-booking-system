const sql = require("mssql");
const { poolPromise } = require("../config/db");
const {
    getWorkflowHistory,
    changeWorkflowStatus
} = require("../services/WorkflowService");

const {
    getBookingDetails
} = require("../services/bookingService");

const AuthorizationService = require("../services/AuthorizationService");

const { generateAllocationId } = require("../utils/idGenerator");
const NotificationService = require("../notifications/notificationService");
const { formatDate } = require("../utils/dateFormater");

exports.getApplications = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const actionRequired =
            String(req.query.actionRequired).toLowerCase() === "true";

        const request = pool.request()

            .input(
                "UserID",
                sql.VarChar,
                currentUser.UserId.toString()
            )

        console.log("Action Required:", actionRequired);
        console.log("Current User:", currentUser.UserId);
        // console.log("Query:\n", query);

        let query = `

SELECT

    b.GHBookingID,
    b.GHRBookingNo,
    b.GuestName,
    b.GuestDesignation,
    b.PurposeOfVisit,
    b.ArrivalDateTime,
    b.DepartureDateTime,
    b.BookingDateTime,
    b.BookingStatus,
    g.GuestHouseName,
    gt.GuestTypeName

FROM GuestHouseRoomBookings b

LEFT JOIN GuestHouseMaster g
ON b.GuestHouseID = g.GuestHouseID

LEFT JOIN GuestTypeMaster gt
ON b.GuestTypeID = gt.GuestTypeID

WHERE

    b.IsActive = 1

AND b.AssignedAllocatorID IN
(
    SELECT CAST(RoleMapId AS VARCHAR(20))
    FROM Proof..OrgUnitUserMapping
    WHERE UserId = @UserId
      AND IsActive = 1
)

`;

        if (actionRequired) {

            query += `

AND b.BookingStatus = 'Approved'

`;

        }

        else {

            query += `

AND b.BookingStatus IN
(
    'Approved',
    'Allocated',
    'Checked In',
    'Checked Out'
)

`;

        }

        query += `

ORDER BY b.BookingDateTime DESC

`;

        const result =
            await request.query(query);

        console.log("Result Count:", result.recordset.length);
        console.log(result.recordset);

        return res.status(200).json({

            success: true,

            count: result.recordset.length,

            data: result.recordset

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getDashboardCounts = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

ISNULL(SUM(
CASE
WHEN BookingStatus IN
(
    'Approved',
    'Allocated',
    'Checked In'
)
THEN 1
ELSE 0
END
),0) AS TotalApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Approved'
THEN 1
ELSE 0
END
),0) AS PendingForRoomAllocation,

ISNULL(SUM(
CASE
WHEN BookingStatus='Allocated'
THEN 1
ELSE 0
END
),0) AS PendingForCheckIn,

ISNULL(SUM(
CASE
WHEN BookingStatus='Checked In'
THEN 1
ELSE 0
END
),0) AS PendingForCheckOut

FROM GuestHouseRoomBookings

WHERE

    IsActive = 1

    AND AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

`);

        return res.status(200).json({

            success: true,

            data: result.recordset[0]

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getApplication = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const bookingId = req.params.bookingId;

        const pool = await poolPromise;

        //-------------------------------------------------------
        // Booking Details
        //-------------------------------------------------------

        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    b.*,

    g.GuestHouseName,

    gt.GuestTypeName

FROM GuestHouseRoomBookings b

LEFT JOIN GuestHouseMaster g
ON b.GuestHouseID = g.GuestHouseID

LEFT JOIN GuestTypeMaster gt
ON b.GuestTypeID = gt.GuestTypeID

WHERE

    b.GHBookingID = @BookingID

    AND b.IsActive = 1

    AND b.AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

`);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Application not found or not assigned to you."

            });

        }

        //-------------------------------------------------------
        // Room Requirements
        //-------------------------------------------------------

        const roomResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    d.RoomTypeID,

    r.RoomTypeName,

    d.NoOfRooms

FROM GuestHouseBookingRoomDetails d

LEFT JOIN RoomTypeMaster r
ON d.RoomTypeID = r.RoomTypeID

WHERE

    d.GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Room Allocations
        //-------------------------------------------------------

        const allocationResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    A.GHRAllocationID,

    A.AllocatedRoom,

    R.GHRoomNo AS RoomNumber,

    RT.RoomTypeName,

    A.IsSingleOccupancy,

    A.DayRate,

    A.AllocationStatus

FROM GuestHouseRoomAllocation A

LEFT JOIN GuestHouseRoomMaster R
ON R.GHRMID = A.AllocatedRoom

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = R.RoomTypeID

WHERE

    A.GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Workflow History
        //-------------------------------------------------------

        const workflowHistory =
            await getWorkflowHistory(
                "GuestHouseBooking",
                bookingId
            );

        //-------------------------------------------------------

        const application =
            bookingResult.recordset[0];

        application.RoomRequirements =
            roomResult.recordset;

        application.Allocations =
            allocationResult.recordset;

        application.WorkflowHistory =
            workflowHistory;

        application.TotalRooms =
            roomResult.recordset.reduce(

                (sum, room) =>

                    sum + Number(room.NoOfRooms),

                0

            );

        return res.status(200).json({

            success: true,

            data: application

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getAvailableRooms = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const bookingId = req.params.bookingId;

        //-------------------------------------------------------
        // Booking Details
        //-------------------------------------------------------

        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    GuestHouseID,

    ArrivalDateTime,

    DepartureDateTime,

    AssignedAllocatorID,

    BookingStatus

FROM GuestHouseRoomBookings

WHERE

    GHBookingID = @BookingID

    AND IsActive = 1

    AND AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

`);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Booking not found or not assigned to you."

            });

        }

        const booking =
            bookingResult.recordset[0];

        // Booking must be Approved
        AuthorizationService.ensureBookingStatus(

            booking,

            "Approved"

        );

        //-------------------------------------------------------
        // Room Requirements
        //-------------------------------------------------------

        const roomRequirementResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    RoomTypeID,

    NoOfRooms

FROM GuestHouseBookingRoomDetails

WHERE

    GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Available Rooms
        //-------------------------------------------------------

        const availableRooms = [];

        for (const requirement of roomRequirementResult.recordset) {

            const roomResult = await pool.request()

                .input(
                    "GuestHouseID",
                    sql.VarChar,
                    booking.GuestHouseID
                )

                .input(
                    "RoomTypeID",
                    sql.VarChar,
                    requirement.RoomTypeID
                )

                .input(
                    "ArrivalDateTime",
                    sql.DateTime,
                    booking.ArrivalDateTime
                )

                .input(
                    "DepartureDateTime",
                    sql.DateTime,
                    booking.DepartureDateTime
                )

                .query(`

SELECT

    R.GHRMID AS GuestHouseRoomID,

    R.GHRoomNo AS RoomNumber,

    R.RoomTypeID,

    RT.RoomTypeName,

    C1.DayRate AS SingleRate,

    C2.DayRate AS DoubleRate

FROM GuestHouseRoomMaster R

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = R.RoomTypeID

LEFT JOIN GuestHouseRoomCharges C1
ON C1.GuestHouseID = R.GuestHouseID
AND C1.RoomTypeID = R.RoomTypeID
AND C1.IsSingleOccupancy = 1

LEFT JOIN GuestHouseRoomCharges C2
ON C2.GuestHouseID = R.GuestHouseID
AND C2.RoomTypeID = R.RoomTypeID
AND C2.IsSingleOccupancy = 0

WHERE

    R.GuestHouseID = @GuestHouseID

    AND R.RoomTypeID = @RoomTypeID

    AND R.IsActive = 1

    AND NOT EXISTS
    (

        SELECT 1

        FROM GuestHouseRoomAllocation A

        WHERE

            A.AllocatedRoom = R.GHRMID

            AND A.CheckOutDateTime IS NULL

    )

ORDER BY

    R.GHRoomNo

`);

            availableRooms.push(

                ...roomResult.recordset

            );

        }

        return res.status(200).json({

            success: true,

            count: availableRooms.length,

            data: availableRooms

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};
exports.getReceiptDetails = async (req, res) => {

    try {

        const bookingId = req.params.bookingId;

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

b.GHBookingID,

b.GHRBookingNo,

b.GuestName,

b.GuestDesignation,

b.BookedBy,

b.ArrivalDateTime,

b.DepartureDateTime,

b.AccommodationAmount,

b.MealCharges,

b.AdditionalCharges,

b.DiscountAmount,

b.TotalPayableAmount,

b.PaymentMode,

b.TransactionReference,

g.GuestHouseName,

STRING_AGG(r.GHRoomNo, ', ') AS RoomNumbers,

MIN(a.CheckInDateTime) AS CheckInDateTime,

MAX(a.CheckOutDateTime) AS CheckOutDateTime,

SUM(ISNULL(a.CheckInOccupantsNo,0)) AS Occupants

FROM GuestHouseRoomBookings b

LEFT JOIN GuestHouseMaster g

ON b.GuestHouseID = g.GuestHouseID

LEFT JOIN GuestHouseRoomAllocation a

ON b.GHBookingID = a.GHBookingID

LEFT JOIN GuestHouseRoomMaster r

ON a.AllocatedRoom = r.GHRMID

WHERE b.GHBookingID='@GHBookingID'

GROUP BY

b.GHBookingID,

b.GHRBookingNo,

b.GuestName,

b.GuestDesignation,

b.BookedBy,

b.ArrivalDateTime,

b.DepartureDateTime,

b.AccommodationAmount,

b.MealCharges,

b.AdditionalCharges,

b.DiscountAmount,

b.TotalPayableAmount,

b.PaymentMode,

b.TransactionReference,

g.GuestHouseName

`);

        if (result.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Receipt not found."

            });

        }

        res.json(result.recordset[0]);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getCheckInApplication = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const bookingId = req.params.bookingId;

        const pool = await poolPromise;

        //-------------------------------------------------------
        // Booking Details
        //-------------------------------------------------------

        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    B.*,

    GH.GuestHouseName,

    GT.GuestTypeName

FROM GuestHouseRoomBookings B

LEFT JOIN GuestHouseMaster GH
ON LTRIM(RTRIM(GH.GuestHouseID)) = LTRIM(RTRIM(B.GuestHouseID))

LEFT JOIN GuestTypeMaster GT
ON LTRIM(RTRIM(GT.GuestTypeID)) = LTRIM(RTRIM(B.GuestTypeID))

WHERE

    B.GHBookingID = @BookingID

    AND B.IsActive = 1

    AND B.AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

`);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Booking not found or not assigned to you."

            });

        }

        const booking = bookingResult.recordset[0];

        // Validate Status
        AuthorizationService.ensureBookingStatus(

            booking,

            "Allocated"

        );

        //-------------------------------------------------------
        // Allocated Rooms
        //-------------------------------------------------------

        const allocationResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    A.GHRAllocationID,

    A.AllocatedRoom,

    R.GHRoomNo AS RoomNumber,

    RT.RoomTypeName,

    A.IsSingleOccupancy,

    A.DayRate,

    A.AllocationStatus

FROM GuestHouseRoomAllocation A

LEFT JOIN GuestHouseRoomMaster R
ON R.GHRMID = A.AllocatedRoom

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = R.RoomTypeID

WHERE

    A.GHBookingID = @BookingID

ORDER BY

    R.GHRoomNo

`);

        //-------------------------------------------------------
        // Workflow History
        //-------------------------------------------------------

        const workflowHistory =
            await getWorkflowHistory(
                "GuestHouseBooking",
                bookingId
            );

        booking.Allocations =
            allocationResult.recordset;

        booking.WorkflowHistory =
            workflowHistory;

        return res.status(200).json({

            success: true,

            data: booking

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.checkoutGuest = async (req, res) => {

    const transaction =
        new sql.Transaction(await poolPromise);

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        await transaction.begin();

        const bookingId = req.params.bookingId;

        const {

            mealCharges,

            additionalCharges,

            discount,

            paymentMode,

            transactionReference,

            totalPayableAmount,

            remarks = ""

        } = req.body;

        //-------------------------------------------------------
        // Fetch Booking
        //-------------------------------------------------------

        const booking =
            await getBookingDetails(bookingId);

        if (!booking) {

            throw new Error(
                "Booking not found."
            );

        }

        // Validate Assignment
        await AuthorizationService.ensureAssignedRole(

            booking.AssignedAllocatorID,

            currentUser,

            "Allocator"

        );

        // Validate Status
        AuthorizationService.ensureBookingStatus(

            booking,

            "Checked In"

        );

        //-------------------------------------------------------
        // Update Booking Charges
        //-------------------------------------------------------

        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "MealCharges",
                sql.Decimal(18, 2),
                mealCharges || 0
            )

            .input(
                "AdditionalCharges",
                sql.Decimal(18, 2),
                additionalCharges || 0
            )

            .input(
                "DiscountAmount",
                sql.Decimal(18, 2),
                discount || 0
            )

            .input(
                "TotalPayableAmount",
                sql.Decimal(18, 2),
                totalPayableAmount || 0
            )

            .input(
                "PaymentMode",
                sql.VarChar,
                paymentMode
            )

            .input(
                "TransactionReference",
                sql.VarChar,
                transactionReference
            )

            .input(
                "ModifiedBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .query(`

UPDATE GuestHouseRoomBookings

SET

    MealCharges = @MealCharges,

    AdditionalCharges = @AdditionalCharges,

    DiscountAmount = @DiscountAmount,

    TotalPayableAmount = @TotalPayableAmount,

    PaymentMode = @PaymentMode,

    TransactionReference = @TransactionReference,

    ModifiedBy = @ModifiedBy,

    ModifiedDate = GETDATE()

WHERE

    GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Update Room Allocation
        //-------------------------------------------------------

        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "CheckOutBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .query(`

UPDATE GuestHouseRoomAllocation

SET

    CheckOutDateTime = GETDATE(),

    CheckOutBy = @CheckOutBy,

    AllocationStatus = 'Checked Out'

WHERE

    GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Update Workflow
        //-------------------------------------------------------

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName: "GuestHouseBooking",

                previousStatus: booking.BookingStatus,

                currentStatus: "Checked Out",

                actionName: "Check Out",

                authorityRole: "Guest House Incharge",

                authorityName: currentUser.EmployeeName,

                actionBy: currentUser.EmployeeId,

                remarks

            }

        );

        await transaction.commit();

        //-------------------------------------------------------
        // Notification
        //-------------------------------------------------------

        try {

            await NotificationService.sendCheckOut(

                booking.EmployeeEmail,

                {

                    EmployeeName:
                        booking.EmployeeName,

                    BookingNo:
                        booking.GHRBookingNo,

                    GuestName:
                        booking.GuestName,

                    GuestType:
                        booking.GuestTypeName,

                    Purpose:
                        booking.PurposeOfVisit,

                    ArrivalDate:
                        formatDate(
                            booking.ArrivalDateTime
                        ),

                    DepartureDate:
                        formatDate(
                            booking.DepartureDateTime
                        ),

                    GuestHouse:
                        booking.GuestHouseName,

                    RoomNo:
                        booking.RoomNo || "",

                    RoomType:
                        booking.RoomTypeName || ""

                }

            );

        }

        catch (mailError) {

            console.error(mailError);

        }

        return res.status(200).json({

            success: true,

            message:
                "Guest checked out successfully."

        });

    }

    catch (err) {

        try {

            if (transaction._aborted !== true) {

                await transaction.rollback();

            }

        }

        catch (rollbackError) {

            console.error(rollbackError);

        }

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getCheckoutApplications = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    B.GHBookingID,

    B.GHRBookingNo,

    B.GuestName,

    B.ArrivalDateTime,

    B.DepartureDateTime,

    B.BookingStatus,

    R.GHRoomNo AS RoomNo,

    A.CheckInDateTime,

    A.DayRate,

    A.IsSingleOccupancy

FROM GuestHouseRoomBookings B

LEFT JOIN GuestHouseRoomAllocation A
ON B.GHBookingID = A.GHBookingID

LEFT JOIN GuestHouseRoomMaster R
ON R.GHRMID = A.AllocatedRoom

WHERE

    B.IsActive = 1

    AND B.BookingStatus = 'Checked In'

    AND B.AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

ORDER BY

    A.CheckInDateTime DESC

`);

        return res.status(200).json({

            success: true,

            count: result.recordset.length,

            data: result.recordset

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getCheckoutDetails = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const bookingId = req.params.bookingId;

        const pool = await poolPromise;

        //-------------------------------------------------------
        // Booking Details
        //-------------------------------------------------------

        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    B.*,

    GH.GuestHouseName,

    GT.GuestTypeName

FROM GuestHouseRoomBookings B

LEFT JOIN GuestHouseMaster GH
ON LTRIM(RTRIM(GH.GuestHouseID)) =
   LTRIM(RTRIM(B.GuestHouseID))

LEFT JOIN GuestTypeMaster GT
ON LTRIM(RTRIM(GT.GuestTypeID)) =
   LTRIM(RTRIM(B.GuestTypeID))

WHERE

    B.GHBookingID = @BookingID

    AND B.IsActive = 1

    AND B.AssignedAllocatorID IN
    (
        SELECT CAST(RoleMapId AS VARCHAR(20))
        FROM Proof..OrgUnitUserMapping
        WHERE
            UserId = @UserID
            AND IsActive = 1
    )

`);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Booking not found or not assigned to you."

            });

        }

        const booking =
            bookingResult.recordset[0];

        // Status Validation
        AuthorizationService.ensureBookingStatus(

            booking,

            "Checked In"

        );

        //-------------------------------------------------------
        // Allocated Rooms
        //-------------------------------------------------------

        const roomResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    A.GHRAllocationID,

    RM.GHRoomNo,

    RT.RoomTypeName,

    A.IsSingleOccupancy,

    A.DayRate,

    A.CheckInDateTime,

    DATEDIFF
    (
        DAY,
        A.CheckInDateTime,
        GETDATE()
    ) + 1 AS StayDays,

    A.DayRate *
    (
        DATEDIFF
        (
            DAY,
            A.CheckInDateTime,
            GETDATE()
        ) + 1
    ) AS Amount

FROM GuestHouseRoomAllocation A

LEFT JOIN GuestHouseRoomMaster RM
ON RM.GHRMID = A.AllocatedRoom

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = RM.RoomTypeID

WHERE

    A.GHBookingID = @BookingID

ORDER BY

    RM.GHRoomNo

`);

        //-------------------------------------------------------
        // Workflow History
        //-------------------------------------------------------

        const workflowHistory =
            await getWorkflowHistory(

                "GuestHouseBooking",

                bookingId

            );

        //-------------------------------------------------------

        booking.Rooms =
            roomResult.recordset;

        booking.WorkflowHistory =
            workflowHistory;

        booking.TotalAccommodationCharges =
            roomResult.recordset.reduce(

                (sum, room) =>

                    sum + Number(room.Amount),

                0

            );

        return res.status(200).json({

            success: true,

            data: booking

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.allocateRooms = async (req, res) => {

    const transaction =
        new sql.Transaction(await poolPromise);

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        await transaction.begin();

        const bookingId = req.params.bookingId;

        const {

            rooms,

            accommodationAmount,

            remarks = ""

        } = req.body;

        //-------------------------------------------------------
        // Fetch Booking
        //-------------------------------------------------------

        const booking =
            await getBookingDetails(bookingId);

        if (!booking) {

            throw new Error(
                "Booking not found."
            );

        }

        // Validate Assignment
        await AuthorizationService.ensureAssignedRole(

            booking.AssignedAllocatorID,

            currentUser,

            "Allocator"

        );

        // Validate Status
        AuthorizationService.ensureBookingStatus(

            booking,

            "Approved"

        );

        //-------------------------------------------------------
        // Prevent Duplicate Allocation
        //-------------------------------------------------------

        const alreadyAllocated =
            await new sql.Request(transaction)

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

SELECT COUNT(*) AS Total

FROM GuestHouseRoomAllocation

WHERE

    GHBookingID = @BookingID

    AND AllocationStatus = 'Allocated'

`);

        if (alreadyAllocated.recordset[0].Total > 0) {

            throw new Error(
                "Rooms have already been allocated."
            );

        }

        //-------------------------------------------------------
        // Allocate Rooms
        //-------------------------------------------------------

        for (const room of rooms) {

            const allocationId =
                await generateAllocationId(transaction);

            await new sql.Request(transaction)

                .input(
                    "AllocationID",
                    sql.VarChar,
                    allocationId
                )

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .input(
                    "RoomID",
                    sql.VarChar,
                    room.roomId
                )

                .input(
                    "AllocatedBy",
                    sql.VarChar,
                    currentUser.EmployeeId
                )

                .input(
                    "IsSingleOccupancy",
                    sql.Bit,
                    room.isSingleOccupancy
                )

                .input(
                    "DayRate",
                    sql.Decimal(10, 2),
                    room.dayRate
                )

                .query(`

INSERT INTO GuestHouseRoomAllocation
(
    GHRAllocationID,
    GHBookingID,
    AllocatedRoom,
    AllocatedBy,
    AllocatedOn,
    AllocationStatus,
    IsSingleOccupancy,
    DayRate,
    CreatedBy,
    CreatedDate
)

VALUES
(
    @AllocationID,
    @BookingID,
    @RoomID,
    @AllocatedBy,
    GETDATE(),
    'Allocated',
    @IsSingleOccupancy,
    @DayRate,
    @AllocatedBy,
    GETDATE()
)

`);

        }

        //-------------------------------------------------------
        // Update Booking
        //-------------------------------------------------------

        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "AccommodationAmount",
                sql.Decimal(18, 2),
                accommodationAmount
            )

            .input(
                "Remarks",
                sql.NVarChar,
                remarks
            )

            .input(
                "AllocatedBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .query(`

UPDATE GuestHouseRoomBookings

SET

    AccommodationAmount = @AccommodationAmount,

    AllocationRemarks = @Remarks,

    ModifiedBy = @AllocatedBy,

    ModifiedDate = GETDATE()

WHERE

    GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Update Workflow
        //-------------------------------------------------------

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName: "GuestHouseBooking",

                previousStatus: booking.BookingStatus,

                currentStatus: "Allocated",

                actionName: "Allocate Room",

                authorityRole: "Guest House Incharge",

                authorityName: currentUser.EmployeeName,

                actionBy: currentUser.EmployeeId,

                remarks

            }

        );

        await transaction.commit();

        //-------------------------------------------------------
        // Notification
        //-------------------------------------------------------

        try {

            await NotificationService.sendRoomAllocated(

                booking.EmployeeEmail,

                {

                    EmployeeName:
                        booking.EmployeeName,

                    BookingNo:
                        booking.GHRBookingNo,

                    GuestName:
                        booking.GuestName,

                    GuestType:
                        booking.GuestTypeName,

                    Purpose:
                        booking.PurposeOfVisit,

                    ArrivalDate:
                        formatDate(
                            booking.ArrivalDateTime
                        ),

                    DepartureDate:
                        formatDate(
                            booking.DepartureDateTime
                        ),

                    GuestHouse:
                        booking.GuestHouseName,

                    RoomNo: "",

                    RoomType: ""

                }

            );

        }

        catch (mailError) {

            console.error(mailError);

        }

        return res.status(200).json({

            success: true,

            message:
                "Rooms allocated successfully."

        });

    }

    catch (err) {

        try {

            if (transaction._aborted !== true) {

                await transaction.rollback();

            }

        }

        catch (rollbackError) {

            console.error(rollbackError);

        }

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.checkInGuest = async (req, res) => {

    const transaction = new sql.Transaction(await poolPromise);

    try {

        const currentUser = req.user;

        AuthorizationService.ensureAuthenticated(currentUser);

        await AuthorizationService.ensureAllocator(currentUser);

        await transaction.begin();

        const bookingId = req.params.bookingId;

        const {
            proofType,
            proofNumber,
            remarks,
            occupants
        } = req.body;

        const occupantList =
            occupants
                ? JSON.parse(occupants)
                : [];

        const documentBuffer =
            req.file
                ? req.file.buffer
                : null;

        //-------------------------------------------------------
        // Fetch Booking
        //-------------------------------------------------------

        const booking =
            await getBookingDetails(bookingId);

        if (!booking) {

            throw new Error("Booking not found.");

        }

        // Role Assignment Validation
        await AuthorizationService.ensureAssignedRole(

            booking.AssignedAllocatorID,

            currentUser,

            "Allocator"

        );

        // Status Validation
        AuthorizationService.ensureBookingStatus(

            booking,

            "Allocated"

        );

        //-------------------------------------------------------
        // Update Room Allocation
        //-------------------------------------------------------

        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "Occupants",
                sql.Int,
                occupantList.length + 1
            )

            .input(
                "ProofType",
                sql.VarChar,
                proofType
            )

            .input(
                "ProofNumber",
                sql.VarChar,
                proofNumber
            )

            .input(
                "CheckInBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            // Uncomment after column creation
            // .input(
            //     "Document",
            //     sql.VarBinary(sql.MAX),
            //     documentBuffer
            // )

            .query(`

UPDATE GuestHouseRoomAllocation

SET

    CheckInDateTime = GETDATE(),

    CheckInBy = @CheckInBy,

    AllocationStatus = 'Checked In'

WHERE

    GHBookingID = @BookingID

`);

        //-------------------------------------------------------
        // Update Booking Status & Workflow
        //-------------------------------------------------------

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName: "GuestHouseBooking",

                previousStatus: booking.BookingStatus,

                currentStatus: "Checked In",

                actionName: "Check In",

                authorityRole: "Guest House Incharge",

                authorityName: currentUser.EmployeeName,

                actionBy: currentUser.EmployeeId,

                remarks

            }

        );

        await transaction.commit();

        //-------------------------------------------------------
        // Notification
        //-------------------------------------------------------

        try {

            await NotificationService.sendCheckIn(

                booking.EmployeeEmail,

                {

                    EmployeeName: booking.EmployeeName,

                    BookingNo: booking.GHRBookingNo,

                    GuestName: booking.GuestName,

                    GuestType: booking.GuestTypeName,

                    Purpose: booking.PurposeOfVisit,

                    ArrivalDate: formatDate(
                        booking.ArrivalDateTime
                    ),

                    DepartureDate: formatDate(
                        booking.DepartureDateTime
                    ),

                    GuestHouse: booking.GuestHouseName,

                    RoomNo: booking.RoomNo || "",

                    RoomType: booking.RoomTypeName || ""

                }

            );

        }

        catch (mailError) {

            console.error(mailError);

        }

        return res.status(200).json({

            success: true,

            message: "Guest checked in successfully."

        });

    }

    catch (err) {

        try {

            if (transaction._aborted !== true) {

                await transaction.rollback();

            }

        }

        catch (rollbackError) {

            console.error(rollbackError);

        }

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getOccupancySummary = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

(
    SELECT COUNT(*)
    FROM GuestHouseRoomMaster RM
    WHERE
        RM.IsActive = 1
        AND LTRIM(RTRIM(RM.GuestHouseID)) IN
        (
            SELECT DISTINCT
                LTRIM(RTRIM(B.GuestHouseID))
            FROM GuestHouseRoomBookings B
            WHERE
                B.AssignedAllocatorID IN
                (
                    SELECT CAST(RoleMapId AS VARCHAR(20))
                    FROM Proof..OrgUnitUserMapping
                    WHERE
                        UserId = @UserID
                        AND IsActive = 1
                )
        )
) AS TotalRooms,

(
    SELECT COUNT(DISTINCT A.AllocatedRoom)
    FROM GuestHouseRoomAllocation A

    INNER JOIN GuestHouseRoomBookings B
    ON B.GHBookingID = A.GHBookingID

    WHERE

        A.AllocationStatus = 'Checked In'

        AND B.AssignedAllocatorID IN
        (
            SELECT CAST(RoleMapId AS VARCHAR(20))
            FROM Proof..OrgUnitUserMapping
            WHERE
                UserId = @UserID
                AND IsActive = 1
        )

) AS OccupiedRooms,

(
    SELECT COUNT(*)
    FROM GuestHouseRoomBookings B
    WHERE

        B.BookingStatus = 'Allocated'

        AND B.AssignedAllocatorID IN
        (
            SELECT CAST(RoleMapId AS VARCHAR(20))
            FROM Proof..OrgUnitUserMapping
            WHERE
                UserId = @UserID
                AND IsActive = 1
        )

) AS PendingCheckIn,

(
    SELECT COUNT(*)
    FROM GuestHouseRoomBookings B
    WHERE

        B.BookingStatus = 'Checked In'

        AND B.AssignedAllocatorID IN
        (
            SELECT CAST(RoleMapId AS VARCHAR(20))
            FROM Proof..OrgUnitUserMapping
            WHERE
                UserId = @UserID
                AND IsActive = 1
        )

) AS CurrentGuests

`);

        const data = result.recordset[0];

        data.AvailableRooms =
            data.TotalRooms - data.OccupiedRooms;

        return res.status(200).json({

            success: true,

            data

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getRoomAvailability = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        await AuthorizationService.ensureAllocator(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

    R.GHRMID AS RoomID,

    R.GHRoomNo AS RoomNo,

    GH.GuestHouseName,

    RT.RoomTypeName,

    B.GHBookingID,

    B.GuestName,

    B.ArrivalDateTime,

    B.DepartureDateTime,

    A.AllocationStatus

FROM GuestHouseRoomMaster R

LEFT JOIN GuestHouseMaster GH
ON LTRIM(RTRIM(R.GuestHouseID)) =
   LTRIM(RTRIM(GH.GuestHouseID))

LEFT JOIN RoomTypeMaster RT
ON RT.RoomTypeID = R.RoomTypeID

LEFT JOIN GuestHouseRoomAllocation A
ON R.GHRMID = A.AllocatedRoom
AND A.AllocationStatus IN
(
    'Allocated',
    'Checked In'
)

LEFT JOIN GuestHouseRoomBookings B
ON B.GHBookingID = A.GHBookingID

WHERE

    R.IsActive = 1

    AND LTRIM(RTRIM(R.GuestHouseID)) IN
    (

        SELECT DISTINCT
            LTRIM(RTRIM(BK.GuestHouseID))

        FROM GuestHouseRoomBookings BK

        WHERE

            BK.AssignedAllocatorID IN
            (
                SELECT CAST(RoleMapId AS VARCHAR(20))
                FROM Proof..OrgUnitUserMapping
                WHERE
                    UserId = @UserID
                    AND IsActive = 1
            )

    )

ORDER BY

    GH.GuestHouseName,

    R.GHRoomNo

`);

        const rooms = {};

        result.recordset.forEach(row => {

            if (!rooms[row.RoomID]) {

                rooms[row.RoomID] = {

                    RoomID: row.RoomID,

                    RoomNo: row.RoomNo,

                    GuestHouse: row.GuestHouseName,

                    RoomType: row.RoomTypeName,

                    Bookings: []

                };

            }

            if (row.GHBookingID) {

                rooms[row.RoomID].Bookings.push({

                    BookingID: row.GHBookingID,

                    GuestName: row.GuestName,

                    ArrivalDateTime: row.ArrivalDateTime,

                    DepartureDateTime: row.DepartureDateTime,

                    Status: row.AllocationStatus

                });

            }

        });

        return res.status(200).json({

            success: true,

            count: Object.keys(rooms).length,

            data: Object.values(rooms)

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};