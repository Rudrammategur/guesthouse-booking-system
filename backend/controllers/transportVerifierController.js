const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {
    generateTransportBookingId,
    generateTransportBookingNo
} = require("../utils/idGenerator");

const getCurrentUser = require("../utils/getCurrentUser");

const {
    getWorkflowHistory,
    changeWorkflowStatus
} = require("../services/workflowService");

const WorkflowResolverService =
    require("../services/WorkflowResolverService");

const {
    insertWorkflowHistory
} = require("../services/workflowService");

const AuthorizationService = require("../services/AuthorizationService");


exports.getDashboardCounts = async (req, res) => {

    try {

        console.log("========== TRANSPORT VERIFIER DASHBOARD ==========");

        const currentUser = getCurrentUser(req);

        console.log("Current User:", currentUser);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                currentUser.UserId
            )

            .query(`

                SELECT

                    COUNT(*) AS TotalApplications,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Submitted'
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
                                    'Verified',
                                    'Approved',
                                    'Rejected',
                                    'Allocated',
                                    'Checked In',
                                    'Checked Out'
                                )
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS AllProcessedApplications

                FROM TransportBookings

                WHERE IsActive = 1

                AND BookingStatus <> 'Cancelled'

                AND AssignedVerifierID IN (

                    SELECT RoleMapId

                    FROM Proof..OrgUnitUserMapping

                    WHERE UserId = @UserID

                    AND IsActive = 1

                )

            `);

        console.log(
            "Transport Verifier Dashboard Result:",
            result.recordset
        );

        return res.json({

            success: true,

            data: result.recordset[0]

        });

    }

    catch (err) {

        console.error(
            "Transport verifier dashboard error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getApplications = async (req, res) => {

    try {

        console.log("========== TRANSPORT VERIFIER APPLICATIONS ==========");

        const currentUser = getCurrentUser(req);

        console.log("Current User:", currentUser);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "UserID",
                sql.BigInt,
                currentUser.UserId
            )

            .query(`

                SELECT

                    b.TransportBookingID,
                    b.TransportBookingNo,

                    b.TravellerName,
                    b.TravellerContactNo,
                    b.NumberOfTravellers,

                    b.BookingType,
                    b.SeatingCapacity,

                    b.DepartureLocation,
                    b.ArrivalLocation,

                    b.DepartureDateTime,
                    b.ArrivalDateTime,

                    b.PurposeOfTravel,

                    b.BookedBy,
                    b.BookingDateTime,

                    b.BookingStatus

                FROM TransportBookings b

                WHERE

                    b.IsActive = 1

                AND b.AssignedVerifierID IN (

                    SELECT RoleMapId

                    FROM Proof..OrgUnitUserMapping

                    WHERE UserId = @UserID

                    AND IsActive = 1

                )

                AND b.BookingStatus IN (

                    'Submitted',
                    'Verified',
                    'Rejected',
                    'Approved',
                    'Allocated',
                    'Checked In',
                    'Checked Out'

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

        console.error(
            "Transport verifier applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getApplication = async (req, res) => {

    try {

        const currentUser = getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        // Authentication
        // AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        // await AuthorizationService.ensureVerifier(currentUser);

        const pool = await poolPromise;

        const bookingId = req.params.bookingId;

        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

                SELECT

                    b.*,

                    ebi.DisplayName AS ApplicantName,

                    vr.RoleName AS VerifierRole,

                    ar.RoleName AS ApproverRole,

                    tr.RoleName AS TransportOfficeRole

                FROM TransportBookings b

                LEFT JOIN HR..EmployeeBasicInfo ebi
                    ON ebi.EmployeeId = b.BookedBy

                /* Verifier */

                LEFT JOIN Proof..OrgUnitRoleMapping ov
                    ON ov.RoleMapID = b.AssignedVerifierID

                LEFT JOIN Proof..RoleMaster vr
                    ON vr.RoleID = ov.RoleID

                /* Approver */

                LEFT JOIN Proof..OrgUnitRoleMapping oa
                    ON oa.RoleMapID = b.AssignedApproverID

                LEFT JOIN Proof..RoleMaster ar
                    ON ar.RoleID = oa.RoleID

                /* Transport Office */

                LEFT JOIN Proof..OrgUnitRoleMapping ot
                    ON ot.RoleMapID = b.AssignedTransportOfficeID

                LEFT JOIN Proof..RoleMaster tr
                    ON tr.RoleID = ot.RoleID

                WHERE

                    b.TransportBookingID = @BookingID

                AND b.IsActive = 1

            `);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Application not found."

            });

        }

        const application = bookingResult.recordset[0];

        /*
         * Workflow History
         */

        application.WorkflowHistory =
            await getWorkflowHistory(
                "Transport",
                bookingId
            );

        /*
         * Assigned Roles
         */

        application.AssignedVerifier = {

            RoleName:
                application.VerifierRole || "-"

        };

        application.AssignedApprover = {

            RoleName:
                application.ApproverRole || "-"

        };

        application.AssignedTransportOffice = {

            RoleName:
                application.TransportOfficeRole || "-"

        };

        return res.status(200).json({

            success: true,

            data: application

        });

    }

    catch (err) {

        console.error(
            "Transport verifier get application error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.verifyApplication = async (req, res) => {

    const transaction =
        new sql.Transaction(await poolPromise);

    try {

        await transaction.begin();

        const bookingId =
            req.params.bookingId;

        const remarks =
            req.body.remarks || "";

        /*
         * Get Transport Booking
         */

        const pool = await poolPromise;

        const bookingResult =
            await pool.request()

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

                    SELECT

                        TransportBookingID,
                        BookingStatus,
                        AssignedVerifierID

                    FROM TransportBookings

                    WHERE TransportBookingID = @BookingID

                    AND IsActive = 1

                `);

        if (
            bookingResult.recordset.length === 0
        ) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        const booking =
            bookingResult.recordset[0];


        /*
         * Current User
         */

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            await transaction.rollback();

            return res.status(401).json({

                success: false,

                message: "User authentication failed."

            });

        }

        AuthorizationService.ensureAssignedRole(
            booking.AssignedVerifierID,
            currentUser,
            "Verifier"
        );

        AuthorizationService.ensureBookingStatus(
            booking,
            "Submitted"
        );


        /*
         * Change Workflow Status
         */

        await changeWorkflowStatus(
            transaction,
            {

                bookingId,

                moduleName: "Transport",

                previousStatus:
                    booking.BookingStatus,

                currentStatus:
                    "Verified",

                actionName:
                    "Verify",

                authorityRole:
                    "Verifier",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks

            }
        );


        /*
         * Commit
         */

        await transaction.commit();


        return res.status(200).json({

            success: true,

            message:
                "Application verified successfully."

        });

    }

    catch (err) {

        try {

            await transaction.rollback();

        }

        catch (rollbackError) {

            console.error(
                "Transaction rollback failed:",
                rollbackError
            );

        }

        console.error(
            "Transport application verification error:",
            err
        );

        return res.status(500).json({

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

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            await transaction.rollback();

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        const bookingId =
            req.params.bookingId;

        const remarks =
            req.body.remarks || "";


        // Authentication
        // AuthorizationService.ensureAuthenticated(currentUser);

        // Authorization
        // await AuthorizationService.ensureVerifier(currentUser);


        /*
         * Fetch Transport Booking
         */

        const pool = await poolPromise;

        const bookingResult =
            await pool.request()

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

                    SELECT

                        TransportBookingID,

                        TransportBookingNo,

                        BookingStatus,

                        AssignedVerifierID,

                        TravellerName,

                        BookedBy

                    FROM TransportBookings

                    WHERE TransportBookingID = @BookingID

                    AND IsActive = 1

                `);


        if (
            bookingResult.recordset.length === 0
        ) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }


        const booking =
            bookingResult.recordset[0];


        /*
         * Assignment Validation
         */

        AuthorizationService.ensureAssignedRole(

            booking.AssignedVerifierID,

            currentUser,

            "Verifier"

        );


        /*
         * Status Validation
         */

        AuthorizationService.ensureBookingStatus(

            booking,

            "Submitted"

        );


        /*
         * Change Workflow Status
         */

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName: "Transport",

                previousStatus:
                    booking.BookingStatus,

                currentStatus:
                    "Rejected",

                actionName:
                    "Reject",

                authorityRole:
                    "Verifier",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks

            }

        );


        /*
         * Commit Transaction
         */

        await transaction.commit();


        /*
         * Notification can be added later
         */

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
            "Transport application rejection error:",
            err
        );


        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};