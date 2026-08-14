const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {
    getWorkflowHistory,
    changeWorkflowStatus
} = require("../services/workflowService");

const {
    getTransportBookingDetails
} = require("../services/bookingService");

const AuthorizationService =
    require("../services/AuthorizationService");

const getCurrentUser =
    require("../utils/getCurrentUser");


// =====================================================
// Dashboard Counts
// =====================================================

exports.getDashboardCounts = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
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

                    AND AssignedApproverID IN (

                        SELECT RoleMapId

                        FROM Proof..OrgUnitUserMapping

                        WHERE UserId = @UserID

                        AND IsActive = 1

                    )

                    AND BookingStatus IN (

                        'Verified',
                        'Approved',
                        'Rejected',
                        'Allocated',
                        'Checked In',
                        'Checked Out'

                    )

                `);

        return res.json({

            success: true,

            data: result.recordset[0]

        });

    }

    catch (err) {

        console.error(
            "Transport approver dashboard error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// =====================================================
// Get Applications
// =====================================================

exports.getApplications = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
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

        return res.status(200).json({

            success: true,

            count: result.recordset.length,

            data: result.recordset

        });

    }

    catch (err) {

        console.error(
            "Transport approver applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// =====================================================
// Get Pending Applications
// =====================================================

exports.getPendingApplications = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
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

                        b.AssignedApproverID IN (

                            SELECT RoleMapId

                            FROM Proof..OrgUnitUserMapping

                            WHERE UserId = @UserID

                            AND IsActive = 1

                        )

                    AND b.IsActive = 1

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

        console.error(
            "Transport approver pending applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// =====================================================
// Get Single Application
// =====================================================

exports.getApplication = async (req, res) => {

    try {

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        const bookingId =
            req.params.bookingId;

        const booking =
            await getTransportBookingDetails(bookingId);

        if (!booking) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        const pool =
            await poolPromise;

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

                        ebi.DisplayName AS ApplicantName,

                        vr.RoleName AS VerifierRole,

                        ar.RoleName AS ApproverRole,

                        tr.RoleName AS TransportOfficeRole

                    FROM TransportBookings b

                    LEFT JOIN HR..EmployeeBasicInfo ebi
                        ON ebi.EmployeeId = b.BookedBy

                    LEFT JOIN Proof..OrgUnitRoleMapping ov
                        ON ov.RoleMapID =
                           b.AssignedVerifierID

                    LEFT JOIN Proof..RoleMaster vr
                        ON vr.RoleID = ov.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping oa
                        ON oa.RoleMapID =
                           b.AssignedApproverID

                    LEFT JOIN Proof..RoleMaster ar
                        ON ar.RoleID = oa.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping ot
                        ON ot.RoleMapID =
                           b.AssignedTransportOfficeID

                    LEFT JOIN Proof..RoleMaster tr
                        ON tr.RoleID = ot.RoleID

                    WHERE

                        b.TransportBookingID =
                        @BookingID

                    AND b.IsActive = 1

                `);

        if (
            bookingResult.recordset.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message: "Application not found."

            });

        }

        const application =
            bookingResult.recordset[0];


        // Validate Assignment

        AuthorizationService.ensureAssignedRole(
            booking.AssignedApproverID,
            currentUser,
            "Approver"
        );


        // Workflow History

        application.WorkflowHistory =
            await getWorkflowHistory(
                "Transport",
                bookingId
            );


        // Assigned Roles

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
            "Transport approver get application error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// =====================================================
// Approve Application
// =====================================================

exports.approveApplication = async (req, res) => {

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


        const booking =
            await getTransportBookingDetails(bookingId);

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


        // Workflow

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName: "Transport",

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
            "Transport application approval error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// =====================================================
// Reject Application
// =====================================================

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


        const booking =
            await getTransportBookingDetails(bookingId);

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


        // Workflow

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
            "Transport application rejection error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};