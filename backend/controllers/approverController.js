const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {
    getWorkflowHistory,
    changeWorkflowStatus
} = require("../services/workflowService");

const {
    getBookingDetails
} = require("../services/bookingService");

const AuthorizationService =
    require("../services/AuthorizationService");

const getCurrentUser =
    require("../utils/getCurrentUser");


/*
=========================================================
GET APPROVER DASHBOARD COUNTS
=========================================================
*/

exports.getDashboardCounts = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }

        const pool =
            await poolPromise;

        const result =
            await pool.request()

                .input(
                    "UserID",
                    sql.BigInt,
                    Number(currentUser.UserId)
                )

                .query(`

                    SELECT

                        COUNT(*) AS TotalApplications,

                        ISNULL(
                            SUM(
                                CASE
                                    WHEN BookingStatus = 'Verified'
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS PendingApplications,

                        ISNULL(
                            SUM(
                                CASE
                                    WHEN BookingStatus IN (
                                        'Approved',
                                        'Rejected',
                                        'Allocated',
                                        'Checked In',
                                        'Checked Out',
                                        'Cancelled'
                                    )
                                    THEN 1
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS AllProcessedApplications

                    FROM GuestHouseRoomBookings

                    WHERE AssignedApproverID IN (

                        SELECT RoleMapId

                        FROM Proof..OrgUnitUserMapping

                        WHERE UserId = @UserID

                        AND IsActive = 1

                    )

                    AND IsActive = 1

                    AND BookingStatus IN (

                        'Verified',
                        'Approved',
                        'Rejected',
                        'Allocated',
                        'Checked In',
                        'Checked Out'

                    )

                `);


        return res.status(200).json({

            success: true,

            data:
                result.recordset[0]

        });

    }

    catch (err) {

        console.error(
            "Approver dashboard counts error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
GET APPROVER APPLICATIONS
=========================================================
*/

exports.getApplications = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }

        const pool =
            await poolPromise;

        /*
         * IMPORTANT:
         *
         * currentUser.UserId is the actual logged-in
         * employee/user ID.
         *
         * We use OrgUnitUserMapping to find the
         * RoleMapID(s) assigned to this user.
         */

        const result =
            await pool.request()

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

                        b.BookingStatus,

                        b.ExpenditureHead,

                        b.AssignedApproverID

                    FROM GuestHouseRoomBookings b

                    LEFT JOIN GuestTypeMaster gt

                        ON gt.GuestTypeID =
                           b.GuestTypeID

                    WHERE

                        b.AssignedApproverID IN (

                            SELECT RoleMapId

                            FROM Proof..OrgUnitUserMapping

                            WHERE UserId = @UserID

                            AND IsActive = 1

                        )

                    AND b.IsActive = 1

                    AND b.BookingStatus IN (

                        'Verified',
                        'Approved',
                        'Rejected',
                        'Allocated',
                        'Checked In',
                        'Checked Out'

                    )

                    ORDER BY
                        b.BookingDateTime DESC

                `);


        console.log(
            "CURRENT USER:",
            currentUser
        );

        console.log(
            "APPROVER APPLICATION COUNT:",
            result.recordset.length
        );


        return res.status(200).json({

            success: true,

            count:
                result.recordset.length,

            data:
                result.recordset

        });

    }

    catch (err) {

        console.error(
            "Approver applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
GET SINGLE APPLICATION
=========================================================
*/

exports.getApplication = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }

        const bookingId =
            req.params.bookingId;


        /*
         * IMPORTANT:
         *
         * Always get the complete booking first.
         *
         * getBookingDetails() should contain the
         * workflow assignment, including:
         *
         * AssignedApproverID
         *
         * This is important because different
         * expenditure heads/project funds can have
         * different approvers.
         */

        const booking =
            await getBookingDetails(
                bookingId
            );


        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."

            });

        }


        console.log(
            "=========================="
        );

        console.log(
            "Booking ID:",
            booking.GHBookingID
        );

        console.log(
            "Expenditure Head:",
            booking.ExpenditureHead
        );

        console.log(
            "Assigned Approver:",
            booking.AssignedApproverID
        );

        console.log(
            "Logged User ID:",
            currentUser.UserId
        );

        console.log(
            "=========================="
        );


        /*
         * IMPORTANT AUTHORIZATION CHECK
         *
         * This checks whether the logged-in user
         * is actually the approver assigned to
         * THIS particular booking.
         *
         * Therefore:
         *
         * Project Fund -> Approver A
         * Expenditure Head -> Approver B
         *
         * will work correctly.
         */

        AuthorizationService.ensureAssignedRole(

            booking.AssignedApproverID,

            currentUser,

            "Approver"

        );


        const pool =
            await poolPromise;


        /*
         * Get detailed application information.
         */

        const bookingResult =
            await pool.request()

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

                    SELECT

                        b.*,

                        gt.GuestTypeName,

                        gh.GuestHouseName,

                        ebi.DisplayName AS ApplicantName

                    FROM GuestHouseRoomBookings b

                    LEFT JOIN GuestTypeMaster gt

                        ON gt.GuestTypeID =
                           b.GuestTypeID

                    LEFT JOIN GuestHouseMaster gh

                        ON gh.GuestHouseID =
                           b.GuestHouseID

                    LEFT JOIN HR..EmployeeBasicInfo ebi

                        ON ebi.EmployeeId =
                           b.BookedBy

                    WHERE

                        b.GHBookingID = @BookingID

                    AND b.IsActive = 1

                `);


        if (
            bookingResult.recordset.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Application not found."

            });

        }


        const application =
            bookingResult.recordset[0];


        /*
         * Room Requirements
         */

        const roomResult =
            await pool.request()

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

                        ON rt.RoomTypeID =
                           d.RoomTypeID

                    WHERE

                        d.GHBookingID =
                        @BookingID

                `);


        /*
         * Workflow History
         */

        const workflowHistory =
            await getWorkflowHistory(

                "GuestHouse",

                bookingId

            );


        application.RoomRequirements =
            roomResult.recordset;

        application.WorkflowHistory =
            workflowHistory;


        /*
         * Keep the resolved assignment information
         * available to the frontend if required.
         */

        application.AssignedApproverID =
            booking.AssignedApproverID;

        application.ExpenditureHead =
            booking.ExpenditureHead;


        return res.status(200).json({

            success: true,

            data:
                application

        });

    }

    catch (err) {

        console.error(
            "Approver get application error:",
            err
        );

        return res.status(
            err.statusCode || 500
        ).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
GET PENDING APPLICATIONS
=========================================================
*/

exports.getPendingApplications = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }

        const pool =
            await poolPromise;


        /*
         * IMPORTANT FIX:
         *
         * Do NOT use:
         *
         * currentUser.AssignedApproverID
         *
         * as UserID.
         *
         * UserID must be currentUser.UserId.
         */

        const result =
            await pool.request()

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

                        b.BookingStatus,

                        b.ExpenditureHead,

                        b.AssignedApproverID

                    FROM GuestHouseRoomBookings b

                    LEFT JOIN GuestTypeMaster gt

                        ON gt.GuestTypeID =
                           b.GuestTypeID

                    WHERE

                        b.AssignedApproverID IN (

                            SELECT RoleMapId

                            FROM Proof..OrgUnitUserMapping

                            WHERE UserId = @UserID

                            AND IsActive = 1

                        )

                    AND b.IsActive = 1

                    AND b.BookingStatus =
                        'Verified'

                    ORDER BY
                        b.BookingDateTime DESC

                `);


        return res.status(200).json({

            success: true,

            count:
                result.recordset.length,

            data:
                result.recordset

        });

    }

    catch (err) {

        console.error(
            "Pending applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
REJECT APPLICATION
=========================================================
*/

exports.rejectApplication = async (req, res) => {

    const transaction =
        new sql.Transaction(
            await poolPromise
        );

    try {

        await transaction.begin();


        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            await transaction.rollback();

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }


        const bookingId =
            req.params.bookingId;

        const remarks =
            req.body.remarks || "";


        /*
         * Get the booking using the central
         * booking service.
         */

        const booking =
            await getBookingDetails(
                bookingId
            );


        if (!booking) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."

            });

        }


        /*
         * Verify that THIS logged-in user is the
         * approver assigned to THIS booking.
         *
         * This is what handles the two-approver case.
         */

        AuthorizationService.ensureAssignedRole(

            booking.AssignedApproverID,

            currentUser,

            "Approver"

        );


        /*
         * Only Verified applications can be rejected
         * by the approver.
         */

        AuthorizationService.ensureBookingStatus(

            booking,

            "Verified"

        );


        console.log(
            "Rejecting Guest House booking:",
            booking.GHBookingID
        );

        console.log(
            "Assigned Approver:",
            booking.AssignedApproverID
        );

        console.log(
            "Current User:",
            currentUser.UserId
        );

        console.log(
            "Expenditure Head:",
            booking.ExpenditureHead
        );


        /*
         * Update workflow.
         */

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName:
                    "GuestHouse",

                previousStatus:
                    booking.BookingStatus,

                currentStatus:
                    "Rejected",

                actionName:
                    "Reject",

                authorityRole:
                    "Approver",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks

            }

        );


        await transaction.commit();


        return res.status(200).json({

            success: true,

            message:
                "Application rejected successfully."

        });

    }

    catch (err) {

        try {

            if (
                transaction._aborted !== true
            ) {

                await transaction.rollback();

            }

        }

        catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        console.error(
            "Guest House application rejection error:",
            err
        );


        return res.status(
            err.statusCode || 500
        ).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
APPROVE APPLICATION
=========================================================
*/

exports.approveApplication = async (req, res) => {

    const transaction =
        new sql.Transaction(
            await poolPromise
        );

    try {

        await transaction.begin();


        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            await transaction.rollback();

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }


        const bookingId =
            req.params.bookingId;

        const remarks =
            req.body.remarks || "";


        /*
         * Get booking from central service.
         *
         * This is important because the booking service
         * resolves AssignedApproverID according to the
         * booking's workflow/expenditure configuration.
         */

        const booking =
            await getBookingDetails(
                bookingId
            );


        if (!booking) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."

            });

        }


        /*
         * Validate the assigned approver.
         */

        AuthorizationService.ensureAssignedRole(

            booking.AssignedApproverID,

            currentUser,

            "Approver"

        );


        /*
         * Validate workflow status.
         */

        AuthorizationService.ensureBookingStatus(

            booking,

            "Verified"

        );


        console.log(
            "Approving Guest House booking:",
            booking.GHBookingID
        );

        console.log(
            "Assigned Approver:",
            booking.AssignedApproverID
        );

        console.log(
            "Current User:",
            currentUser.UserId
        );

        console.log(
            "Expenditure Head:",
            booking.ExpenditureHead
        );


        /*
         * Update workflow.
         */

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName:
                    "GuestHouse",

                previousStatus:
                    booking.BookingStatus,

                currentStatus:
                    "Approved",

                actionName:
                    "Approve",

                authorityRole:
                    "Approver",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks

            }

        );


        await transaction.commit();


        return res.status(200).json({

            success: true,

            message:
                "Application approved successfully."

        });

    }

    catch (err) {

        try {

            if (
                transaction._aborted !== true
            ) {

                await transaction.rollback();

            }

        }

        catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        console.error(
            "Guest House application approval error:",
            err
        );


        return res.status(
            err.statusCode || 500
        ).json({

            success: false,

            message:
                err.message

        });

    }

};


/*
=========================================================
VIEW SUPPORTING DOCUMENT
=========================================================
*/

exports.viewDocument = async (req, res) => {

    try {

        const pool =
            await poolPromise;

        const bookingId =
            req.params.bookingId;


        const result =
            await pool.request()

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

                    SELECT SupportingDoc

                    FROM GuestHouseRoomBookings

                    WHERE GHBookingID =
                          @BookingID

                `);


        if (
            result.recordset.length === 0 ||
            !result.recordset[0].SupportingDoc
        ) {

            return res.status(404).send(
                "Document not found."
            );

        }


        const buffer =
            result.recordset[0].SupportingDoc;


        /*
         * PNG detection.
         */

        if (

            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47

        ) {

            res.setHeader(
                "Content-Type",
                "image/png"
            );

        }

        else {

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

        }


        res.setHeader(
            "Content-Disposition",
            "inline"
        );


        res.send(buffer);

    }

    catch (err) {

        console.error(
            "Guest House supporting document error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};