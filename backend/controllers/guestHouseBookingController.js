const sql = require("mssql");
const { poolPromise } = require("../config/db");
const { assignWorkflow } = require("../services/assignmentService");
const {
    getBookingDetails
} = require("../services/bookingService");

const AuthorizationService = require ("../services/AuthorizationService");

const { generateGuestHouseBookingId, generateGuestHouseBookingNo } = require("../utils/idGenerator");

const NotificationService = require("../notifications/notificationService");

const { insertWorkflowHistory, changeWorkflowStatus } = require("../services/WorkflowService");

const { formatDate } = require("../utils/dateFormater");

const WorkflowResolverService = require("../services/WorkflowResolverService");


exports.createBooking = async (req, res) => {

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);


    try {

        const data = req.body;

        const currentUser = req.user;

        const employeeEmail = req.user.EmployeeEmail;

        AuthorizationService.ensureAuthenticated(currentUser);

        await AuthorizationService.ensureApplicant(currentUser);

        const workflow =
            await WorkflowResolverService.resolveWorkflow(

                currentUser.RoleMapIDs[0], // Temporary - default role for testing

                data.ExpenditureHead

            );

        // Parse Room Requirements
        data.RoomRequirements = JSON.parse(
            data.RoomRequirements || "[]"
        );

        data.OccupantsNo = Number(data.OccupantsNo);

        data.TotalRoomsReq = Number(data.TotalRoomsReq);

        const documentBuffer = data.SupportingDoc
            ? Buffer.from(data.SupportingDoc, "base64")
            : null;

        // Step 3
        const totalRoomsReq = data.RoomRequirements.reduce(
            (sum, room) => sum + Number(room.NoOfRooms),
            0
        );

        // Step 4
        await transaction.begin();

        const bookingID = await generateGuestHouseBookingId(transaction);

        const bookingNo = await generateGuestHouseBookingNo(transaction);


        // Step 5
        const request = transaction.request();

        console.log("workflow", workflow);

        // INSERT INTO GuestHouseRoomBookings
        const bookingResult =
            await request
                .input("BookingID", sql.VarChar, bookingID)

                .input("BookingNo", sql.VarChar, bookingNo)

                .input("GuestTypeID", sql.VarChar, data.GuestTypeID, data.GuestTypeID.trim())

                .input("GuestHouseID", sql.VarChar, data.GuestHouseID)

                .input("GuestName", sql.NVarChar, data.GuestName)

                .input("GuestDesignation", sql.NVarChar, data.GuestDesignation)

                .input("GuestAddress", sql.NVarChar, data.GuestAddress)

                .input("PurposeOfVisit", sql.NVarChar, data.PurposeOfVisit)

                .input("GuestNationality", sql.NVarChar, data.GuestNationality)

                .input("GuestContactNo", sql.VarChar, data.GuestContactNo)

                .input("GuestEmailID", sql.VarChar, data.GuestEmailID)

                .input("OccupantsNo", sql.Int, data.OccupantsNo)

                .input("TotalRoomsReq", sql.Int, totalRoomsReq)

                .input("ArrivalDateTime", sql.DateTime, data.ArrivalDateTime)

                .input("DepartureDateTime", sql.DateTime, data.DepartureDateTime)

                .input(
                    "SupportingDoc",
                    sql.VarBinary(sql.MAX),
                    req.file ? req.file.buffer : null
                )

                .input("ExpenditureHead", sql.VarChar, data.ExpenditureHead)

                .input("SplRequests", sql.NVarChar, data.SpecialRequirements)

                .input("ProjectNo", sql.VarChar, data.ProjectNo)

                .input("BookedBy", sql.VarChar, req.user?.EmployeeId)

                .input("BookingDateTime", sql.DateTime, new Date())

                .input("BookingStatus", sql.VarChar, "Submitted")

                .input("ActivityBy", sql.VarChar, req.user?.EmployeeId)

                .input(
                    "AssignedVerifierID",
                    sql.VarChar,
                    workflow.verifierRoleMapID.toString()
                )

                .input(
                    "AssignedApproverID",
                    sql.VarChar,
                    workflow.approverRoleMapID.toString()
                )

                .input(
                    "AssignedAllocatorID",
                    sql.VarChar,
                    workflow.allocatorRoleMapID.toString()
                )

                .query(`
INSERT INTO GuestHouseRoomBookings(

GHBookingID,

GHRBookingNo,

GuestTypeID,

GuestHouseID,

GuestName,

GuestDesignation,

GuestAddress,

PurposeOfVisit,

GuestNationality,

GuestContactNo,

GuestEmailID,

OccupantsNo,

TotalRoomsReq,

SplRequests,

ArrivalDateTime,

DepartureDateTime,

SupportingDoc,

ExpenditureHead,

ProjectNo,

BookedBy,

BookingDateTime,

BookingStatus,

ActivityBy,

AssignedVerifierID,

AssignedApproverID,

AssignedAllocatorID

)

VALUES(
@BookingID,

@BookingNo,

@GuestTypeID,

@GuestHouseID,

@GuestName,

@GuestDesignation,

@GuestAddress,

@PurposeOfVisit,

@GuestNationality,

@GuestContactNo,

@GuestEmailID,

@OccupantsNo,

@TotalRoomsReq,

@SplRequests,

@ArrivalDateTime,

@DepartureDateTime,

@SupportingDoc,

@ExpenditureHead,

@ProjectNo,

@BookedBy,

@BookingDateTime,

@BookingStatus,

@ActivityBy,

@AssignedVerifierID,

@AssignedApproverID,

@AssignedAllocatorID

)
`);
        for (const room of data.RoomRequirements) {

            const detailID =
                `GHRD${Date.now()}${Math.floor(Math.random() * 1000)}`;

            await new sql.Request(transaction)

                .input("DetailID", sql.VarChar, detailID)

                .input("BookingID", sql.VarChar, bookingID)

                .input("RoomTypeID", sql.VarChar, room.RoomTypeID)

                .input("NoOfRooms", sql.Int, room.NoOfRooms)

                .query(`

INSERT INTO GuestHouseBookingRoomDetails(

    GHRDetailID,

    GHBookingID,

    RoomTypeID,

    NoOfRooms

)

VALUES(

    @DetailID,

    @BookingID,

    @RoomTypeID,

    @NoOfRooms

)

`);

        }

        await insertWorkflowHistory(transaction, {

            moduleName: "GuestHouseBooking",

            referenceId: bookingID,

            previousStatus: "",

            currentStatus: "Submitted",

            actionName: "Submit",

            authorityRole: "Applicant",

            authorityName: req.user.EmployeeName,

            actionBy: req.user.EmployeeId,

            remarks: ""

        });

        await transaction.commit();

        try {
            await NotificationService.sendBookingSubmitted(

                req.user.EmployeeEmail,

                {

                    EmployeeName: req.user.EmployeeName,

                    BookingNo: bookingNo,

                    GuestName: data.GuestName,

                    Purpose: data.PurposeOfVisit,

                    ArrivalDate: formatDate(data.ArrivalDateTime),

                    DepartureDate: formatDate(data.DepartureDateTime),

                    SubmittedOn: formatDate(new Date())

                }

            );
        } catch (mailError) {
            console.error("Email failed:", mailError);
        }


        res.status(201).json({

            success: true,

            BookingID: bookingID,

            BookingNo: bookingNo,

            message: "Booking submitted successfully"

        });

    }
    catch (error) {

        if (transaction._aborted !== true) {
            try {
                await transaction.rollback();
            } catch (err) {
                console.log("Rollback skipped:", err.message);
            }
        }

        console.log("Original Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.getDashboardCounts = async (req, res) => {

    try {

        const pool = await poolPromise;

        const currentUser = req.user;

        AuthorizationService.ensureAuthenticated(currentUser);

        await AuthorizationService.ensureApplicant(currentUser);

        const employeeId = currentUser.EmployeeId;

        const result = await pool.request()

            .input(
                "EmployeeID",
                sql.VarChar,
                employeeId
            )

            .query(`

SELECT

COUNT(*) AS TotalApplications,

ISNULL(SUM(CASE WHEN BookingStatus='Submitted' THEN 1 ELSE 0 END),0) AS Submitted,

ISNULL(SUM(CASE WHEN BookingStatus='Verified' THEN 1 ELSE 0 END),0) AS Verified,

ISNULL(SUM(CASE WHEN BookingStatus='Approved' THEN 1 ELSE 0 END),0) AS Approved,

ISNULL(SUM(CASE WHEN BookingStatus='Rejected' THEN 1 ELSE 0 END),0) AS Rejected,

ISNULL(SUM(CASE WHEN BookingStatus='Allocated' THEN 1 ELSE 0 END),0) AS Allocated,

ISNULL(SUM(CASE WHEN BookingStatus='Checked In' THEN 1 ELSE 0 END),0) AS CheckedIn,

ISNULL(SUM(CASE WHEN BookingStatus='Checked Out' THEN 1 ELSE 0 END),0) AS Completed,

ISNULL(SUM(CASE WHEN BookingStatus='Cancelled' THEN 1 ELSE 0 END),0) AS Cancelled

FROM GuestHouseRoomBookings

WHERE
    BookedBy = @EmployeeID
    AND IsActive = 1;

`);

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

exports.getMyApplications = async (req, res) => {

    try {

        const currentUser = req.user;

        AuthorizationService.ensureAuthenticated(currentUser);

await AuthorizationService.ensureApplicant(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "EmployeeID",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .query(`

SELECT

    b.GHBookingID,

    b.GHRBookingNo,

    b.GuestName,

    gt.GuestTypeName,

    gh.GuestHouseName,

    b.ArrivalDateTime,

    b.DepartureDateTime,

    b.BookingDateTime,

    b.BookingStatus

FROM GuestHouseRoomBookings b

LEFT JOIN GuestTypeMaster gt
ON gt.GuestTypeID = b.GuestTypeID

LEFT JOIN GuestHouseMaster gh
ON gh.GuestHouseID = b.GuestHouseID

WHERE

    b.BookedBy = @EmployeeID

    AND b.IsActive = 1

ORDER BY

    b.BookingDateTime DESC

`);

        res.json({
            success: true,
            data: result.recordset
        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};
const { getWorkflowHistory } = require("../services/workflowService");

exports.getApplicationDetails = async (req, res) => {

    try {

        const pool = await poolPromise;

        const currentUser = req.user;

        // Authentication & Authorization
        AuthorizationService.ensureAuthenticated(currentUser);
        await AuthorizationService.ensureApplicant(currentUser);

        const bookingId = req.params.bookingId;

        const [

            applicationResult,

            roomResult,

            workflowHistory

        ] = await Promise.all([

            pool.request()

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
    gt.GuestTypeName,
    b.GuestDesignation,
    b.GuestAddress,
    b.GuestNationality,
    b.GuestContactNo,
    b.GuestEmailID,
    b.PurposeOfVisit,
    b.ArrivalDateTime,
    b.DepartureDateTime,
    b.BookingStatus,
    b.BookingDateTime,
    gh.GuestHouseName,
    b.OccupantsNo,
    b.TotalRoomsReq,
    b.ExpenditureHead,
    b.ProjectNo,
    b.SplRequests,
    b.BookedBy,

    b.AssignedVerifierID,
    rv.RoleName AS VerifierRole,

    b.AssignedApproverID,
    ra.RoleName AS ApproverRole,

    b.AssignedAllocatorID,
    rl.RoleName AS AllocatorRole

FROM GuestHouseRoomBookings b

INNER JOIN GuestHouseMaster gh
ON gh.GuestHouseID = b.GuestHouseID

INNER JOIN GuestTypeMaster gt
ON gt.GuestTypeID = b.GuestTypeID

LEFT JOIN Proof..OrgUnitRoleMapping ov
ON ov.RoleMapID = b.AssignedVerifierID

LEFT JOIN Proof..RoleMaster rv
ON rv.RoleID = ov.RoleID

LEFT JOIN Proof..OrgUnitRoleMapping oa
ON oa.RoleMapID = b.AssignedApproverID

LEFT JOIN Proof..RoleMaster ra
ON ra.RoleID = oa.RoleID

LEFT JOIN Proof..OrgUnitRoleMapping ol
ON ol.RoleMapID = b.AssignedAllocatorID

LEFT JOIN Proof..RoleMaster rl
ON rl.RoleID = ol.RoleID

WHERE

    b.GHBookingID = @BookingID
    AND b.IsActive = 1

`),

            pool.request()

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

SELECT

    rt.RoomTypeName,

    br.NoOfRooms

FROM GuestHouseBookingRoomDetails br

INNER JOIN RoomTypeMaster rt
ON rt.RoomTypeID = br.RoomTypeID

WHERE

    br.GHBookingID = @BookingID

`),

            getWorkflowHistory(
                "GuestHouseBooking",
                bookingId
            )

        ]);

        if (applicationResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        const booking = applicationResult.recordset[0];

        AuthorizationService.ensureApplicantOwner(
            booking,
            currentUser
        );

        res.json({

            success: true,

            data: {

                header: {

                    bookingId: booking.GHBookingID,

                    bookingNo: booking.GHRBookingNo,

                    status: booking.BookingStatus

                },

                application: {
    ...booking,

    AssignedVerifier: {
        RoleName: booking.VerifierRole
    },

    AssignedApprover: {
        RoleName: booking.ApproverRole
    },

    AssignedAllocator: {
        RoleName: booking.AllocatorRole
    }
},

                roomRequirements: roomResult.recordset,

                workflowHistory

            }

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.cancelBooking = async (req, res) => {

    const transaction = new sql.Transaction(await poolPromise);

    try {

        await transaction.begin();

        const bookingId = req.params.bookingId;
        const remarks = req.body?.remarks || "";

        const currentUser = req.user;

        // Authentication & Authorization
        AuthorizationService.ensureAuthenticated(currentUser);
        await AuthorizationService.ensureApplicant(currentUser);

        // Fetch Booking
        const booking = await getBookingDetails(bookingId);

        if (!booking) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        // Ownership Validation
        AuthorizationService.ensureApplicantOwner(
            booking,
            currentUser
        );

        // Booking Status Validation
        AuthorizationService.ensureCancellable(
            booking
        );

        // Update Booking Status
        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "EmployeeID",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .query(`

UPDATE GuestHouseRoomBookings

SET

    BookingStatus='Cancelled',

    ActivityBy=@EmployeeID,

    ModifiedBy=@EmployeeID,

    ModifiedDate=GETDATE()

WHERE

    GHBookingID=@BookingID

`);

        // Workflow History
        await insertWorkflowHistory(transaction, {

            moduleName: "GuestHouseBooking",

            referenceId: bookingId,

            previousStatus: booking.BookingStatus,

            currentStatus: "Cancelled",

            actionName: "Cancel",

            authorityRole: "Applicant",

            authorityName: currentUser.EmployeeName,

            actionBy: currentUser.EmployeeId,

            remarks

        });

        await transaction.commit();

        // Notify Applicant
        try {

            await NotificationService.sendBookingCancelled(

                currentUser.EmployeeEmail,

                {

                    EmployeeName: currentUser.EmployeeName,

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

                    CancelledOn: formatDate(new Date()),

                    Remarks: remarks

                }

            );

        }

        catch (mailError) {

            console.error(mailError);

        }

        return res.json({

            success: true,

            message: "Booking cancelled successfully."

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