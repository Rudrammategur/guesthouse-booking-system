const sql = require("mssql");

const { poolPromise } = require("../config/db");
const {
  getWorkflowHistory,
  changeWorkflowStatus
} = require("../services/workflowService");

const {
  getBookingDetails
} = require("../services/bookingService");


const { getEmployeeById } = require("../services/employeeService");
const { formatDate } = require("../utils/dateFormater");

const AuthorizationService = require("../services/AuthorizationService");

exports.getDashboardCounts = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication & Authorization
        AuthorizationService.ensureAuthenticated(currentUser);
        await AuthorizationService.ensureApprover(currentUser);

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                Number(currentUser.UserId)
            )

            .query(`

SELECT

COUNT(*) AS TotalApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Verified'
THEN 1
ELSE 0
END
),0) AS PendingApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Approved'
THEN 1
ELSE 0
END
),0) AS ApprovedApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Rejected'
THEN 1
ELSE 0
END
),0) AS RejectedApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus IN
(
'Approved',
'Rejected'
)
THEN 1
ELSE 0
END
),0) AS AllProcessedApplications

FROM GuestHouseRoomBookings

WHERE AssignedApproverID IN (

    SELECT RoleMapId

    FROM Proof..OrgUnitUserMapping

    WHERE
        UserId = @UserID
        AND IsActive = 1

)

AND IsActive = 1

AND BookingStatus IN
(
'Verified',
'Approved',
'Rejected'
)

`);

        res.json({

            success: true,

            data: result.recordset[0]

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

exports.rejectApplication = async (req, res) => {

  const transaction =
    new sql.Transaction(await poolPromise);

  try {

    await transaction.begin();

    const currentUser = req.user;

    const bookingId = req.params.bookingId;

    const remarks = req.body.remarks || "";

    // Authentication & Authorization
    AuthorizationService.ensureAuthenticated(currentUser);

    await AuthorizationService.ensureApprover(currentUser);

    // Fetch Booking
    const booking =
      await getBookingDetails(bookingId);

    if (!booking) {

      await transaction.rollback();

      return res.status(404).json({

        success: false,

        message: "Booking not found."

      });

    }

    // Assignment Validation
    AuthorizationService.ensureAssignedRole(
      booking.AssignedApproverID,
      currentUser,
      "Approver"
    );

    // Status Validation
    AuthorizationService.ensureBookingStatus(

      booking,

      "Verified"

    );

    // Update Workflow
    await changeWorkflowStatus(

      transaction,

      {

        bookingId,

        previousStatus: booking.BookingStatus,

        currentStatus: "Rejected",

        actionName: "Reject",

        authorityRole: "Approver",

        authorityName: currentUser.EmployeeName,

        actionBy: currentUser.EmployeeId,

        remarks

      }

    );

    await transaction.commit();

    // Notify Applicant
    // try {

    //   if (booking.EmployeeEmail) {

    //     await NotificationService.sendBookingRejected(

    //       booking.EmployeeEmail,

    //       {

    //         EmployeeName: booking.EmployeeName,

    //         BookingNo: booking.GHRBookingNo,

    //         GuestName: booking.GuestName,

    //         GuestType: booking.GuestTypeName,

    //         Purpose: booking.PurposeOfVisit,

    //         ArrivalDate: formatDate(
    //           booking.ArrivalDateTime
    //         ),

    //         DepartureDate: formatDate(
    //           booking.DepartureDateTime
    //         ),

    //         Remarks: remarks

    //       }

    //     );

    //   }

    // }

    // catch (mailError) {

    //   console.error("Email Error:", mailError);

    // }

    return res.status(200).json({

      success: true,

      message: "Application rejected successfully."

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

exports.getApplications = async (req, res) => {

  try {

    const currentUser = req.user;

    // Authentication & Authorization
    AuthorizationService.ensureAuthenticated(currentUser);

    await AuthorizationService.ensureApprover(currentUser);

    const pool = await poolPromise;

    const result = await pool.request()

      .input(
    "UserID",
    sql.BigInt,
    Number(currentUser.UserId)
)

      .query(`

SELECT

    b.GHBookingID,

    b.GHRBookingNo,

    b.GuestName,

    gt.GuestTypeName,

    b.TotalRoomsReq,

    b.BookedBy,

    b.ArrivalDateTime,

    b.DepartureDateTime,

    b.BookingDateTime,

    b.BookingStatus

FROM GuestHouseRoomBookings b

LEFT JOIN GuestTypeMaster gt
ON gt.GuestTypeID = b.GuestTypeID

WHERE b.AssignedApproverID IN (

SELECT RoleMapId

FROM Proof..OrgUnitUserMapping

WHERE UserId=@UserID

AND IsActive=1

)

    AND b.IsActive = 1

    AND b.BookingStatus IN
    (
        'Verified',
        'Approved',
        'Rejected'
    )

ORDER BY

    b.BookingDateTime DESC

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

exports.getApplication = async (req, res) => {

  try {

    const currentUser = req.user;

    const pool = await poolPromise;

    const bookingId = req.params.bookingId;

    const booking =
      await getBookingDetails(bookingId);

    if (!booking) {

      return res.status(404).json({

        success: false,

        message: "Booking not found."

      });

    }

    console.log("==========================");
    console.log("Booking ID:", booking.GHBookingID);
    console.log("Expenditure Head:", booking.ExpenditureHead);
    console.log("Assigned Approver:", booking.AssignedApproverID);
    console.log("Logged User:", currentUser.UserId);
    console.log("==========================");


    // Authentication & Authorization
    AuthorizationService.ensureAuthenticated(currentUser);

    await AuthorizationService.ensureApprover(currentUser);



    // Booking Details
    const bookingResult = await pool.request()

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

    if (bookingResult.recordset.length === 0) {

      return res.status(404).json({

        success: false,

        message: "Application not found."

      });

    }

    const application = bookingResult.recordset[0];

    // Validate Assignment
    AuthorizationService.ensureAssignedRole(
      booking.AssignedApproverID,
      currentUser,
      "Approver"
    );

    // Room Requirements
    const roomResult = await pool.request()

      .input(
        "BookingID",
        sql.VarChar,
        bookingId
      )

      .query(`

SELECT

    d.RoomTypeID,

    rt.RoomTypeName,

    d.NoOfRooms

FROM GuestHouseBookingRoomDetails d

LEFT JOIN RoomTypeMaster rt
ON rt.RoomTypeID = d.RoomTypeID

WHERE

    d.GHBookingID = @BookingID

`);

    // Workflow History
    const workflowHistory =
      await getWorkflowHistory(
        "GuestHouseBooking",
        bookingId
      );

    application.RoomRequirements =
      roomResult.recordset;

    application.WorkflowHistory =
      workflowHistory;

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


exports.getPendingApplications = async (req, res) => {

  try {

    const currentUser = req.user;

    // Authentication & Authorization
    AuthorizationService.ensureAuthenticated(currentUser);

    await AuthorizationService.ensureApprover(currentUser);

    const pool = await poolPromise;

    const result = await pool.request()

      .input(
        "UserID",
        sql.VarChar,
        currentUser.AssignedApproverID.toString()
      )

      .query(`

SELECT

    b.GHBookingID,

    b.GHRBookingNo,

    b.GuestName,

    gt.GuestTypeName,

    b.TotalRoomsReq,

    b.BookedBy,

    b.ArrivalDateTime,

    b.DepartureDateTime,

    b.BookingDateTime,

    b.BookingStatus

FROM GuestHouseRoomBookings b

LEFT JOIN GuestTypeMaster gt
ON gt.GuestTypeID = b.GuestTypeID

WHERE b.AssignedApproverID IN (

SELECT RoleMapId

FROM OrgUnitUserMapping

WHERE UserId=@UserID

AND IsActive=1

)

    AND b.BookingStatus = 'Verified'

ORDER BY

    b.BookingDateTime DESC

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

exports.approveApplication = async (req, res) => {

  const transaction =
    new sql.Transaction(await poolPromise);

  try {

    await transaction.begin();

    const currentUser = req.user;

    const bookingId = req.params.bookingId;

    const remarks = req.body.remarks || "";

    // Authentication & Authorization
    AuthorizationService.ensureAuthenticated(currentUser);

    await AuthorizationService.ensureApprover(currentUser);

    // Fetch Booking
    const booking =
      await getBookingDetails(bookingId);

    if (!booking) {

      await transaction.rollback();

      return res.status(404).json({

        success: false,

        message: "Booking not found."

      });

    }

    // Assignment Validation
    AuthorizationService.ensureAssignedRole(
      booking.AssignedApproverID,
      currentUser,
      "Approver"
    );

    // Status Validation
    AuthorizationService.ensureBookingStatus(

      booking,

      "Verified"

    );

    // Update Workflow
    await changeWorkflowStatus(

      transaction,

      {

        bookingId,

        previousStatus: booking.BookingStatus,

        currentStatus: "Approved",

        actionName: "Approve",

        authorityRole: "Approver",

        authorityName: currentUser.EmployeeName,

        actionBy: currentUser.EmployeeId,

        remarks

      }

    );

    await transaction.commit();

    // Notify Applicant
    // try {

    //   if (booking.EmployeeEmail) {

    //     await NotificationService.sendBookingApproved(

    //       booking.EmployeeEmail,

    //       {

    //         EmployeeName:
    //           booking.EmployeeName,

    //         BookingNo:
    //           booking.GHRBookingNo,

    //         GuestName:
    //           booking.GuestName,

    //         GuestType:
    //           booking.GuestTypeName,

    //         Purpose:
    //           booking.PurposeOfVisit,

    //         ArrivalDate:
    //           formatDate(
    //             booking.ArrivalDateTime
    //           ),

    //         DepartureDate:
    //           formatDate(
    //             booking.DepartureDateTime
    //           )

    //       }

    //     );

    //   }

    // }

    // catch (mailError) {

    //   console.error("Email Error:", mailError);

    // }

    return res.status(200).json({

      success: true,

      message: "Application approved successfully."

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


exports.viewDocument = async (req, res) => {

  try {

    const pool = await poolPromise;

    const bookingId = req.params.bookingId;

    const result = await pool.request()

      .input(
        "BookingID",
        sql.VarChar,
        bookingId
      )

      .query(`

SELECT SupportingDoc

FROM GuestHouseRoomBookings

WHERE GHBookingID=@BookingID

`);

    if (
      result.recordset.length === 0 ||
      !result.recordset[0].SupportingDoc
    ) {

      return res.status(404).send("Document not found.");

    }

    const buffer = result.recordset[0].SupportingDoc;

    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47
    ) {

      res.setHeader("Content-Type", "image/png");

    }
    else {

      res.setHeader("Content-Type", "application/pdf");

    }

    res.send(buffer);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message: err.message

    });

  }

};




