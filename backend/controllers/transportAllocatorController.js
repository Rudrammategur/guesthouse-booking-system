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

const NotificationService =
    require("../notifications/notificationService");

const {
    getEmployeeById
} = require("../services/employeeService");

/*
=========================================================
GET TRANSPORT ALLOCATOR DASHBOARD COUNTS
=========================================================
*/

exports.getDashboardCounts = async (req, res) => {

    try {

        console.log(
            "========== TRANSPORT ALLOCATOR DASHBOARD COUNTS =========="
        );

        const currentUser =
            getCurrentUser(req);

        console.log(
            "Current User:",
            currentUser
        );

        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }


        const userId =
            Number(currentUser.UserId);


        if (!Number.isFinite(userId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid UserId."

            });

        }


        const pool =
            await poolPromise;


        /*
        -----------------------------------------------------
        Get the TransportOffice RoleMapId(s) for this user
        -----------------------------------------------------
        */

        const roleResult =
            await pool.request()

                .input(
                    "UserID",
                    sql.BigInt,
                    userId
                )

                .query(`

                    SELECT DISTINCT

                        oum.RoleMapId

                    FROM Proof..OrgUnitUserMapping oum

                    INNER JOIN Proof..OrgUnitRoleMapping orm

                        ON orm.RoleMapID =
                           oum.RoleMapId

                    INNER JOIN Proof..RoleMaster rm

                        ON rm.RoleID =
                           orm.RoleID

                    WHERE

                        oum.UserId = @UserID

                    AND oum.IsActive = 1

                    AND rm.RoleName =
                        'TransportOffice'

                `);


        const transportOfficeRoleMapIds =
            roleResult.recordset.map(
                row => Number(row.RoleMapId)
            );


        console.log(
            "TransportOffice RoleMapIDs:",
            transportOfficeRoleMapIds
        );


        /*
        -----------------------------------------------------
        User has no TransportOffice role
        -----------------------------------------------------
        */

        if (
            transportOfficeRoleMapIds.length === 0
        ) {

            return res.status(200).json({

                success: true,

                data: {

                    TotalApplications: 0,

                    PendingApplications: 0,

                    AllProcessedApplications: 0

                }

            });

        }


        /*
        -----------------------------------------------------
        Dashboard Counts
        -----------------------------------------------------
        */

        const result =
            await pool.request()

                .input(
                    "UserID",
                    sql.BigInt,
                    userId
                )

                .query(`

                    SELECT

                        ISNULL(
                            SUM(
                                CASE

                                    WHEN BookingStatus IN (
                                        'Submitted',
                                        'Verified',
                                        'Approved',
                                        'Rejected',
                                        'Allocated',
                                        'Vehicle Unavailable'
                                    )

                                    THEN 1

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS TotalApplications,


                        ISNULL(
                            SUM(
                                CASE

                                    WHEN BookingStatus =
                                         'Approved'

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
                                        'Allocated',
                                        'Vehicle Unavailable'
                                    )

                                    THEN 1

                                    ELSE 0

                                END
                            ),
                            0
                        ) AS AllProcessedApplications


                    FROM TransportBookings

                    WHERE

                        IsActive = 1

                    AND AssignedTransportOfficeID IN (

                        SELECT DISTINCT

                            oum.RoleMapId

                        FROM Proof..OrgUnitUserMapping oum

                        INNER JOIN Proof..OrgUnitRoleMapping orm

                            ON orm.RoleMapID =
                               oum.RoleMapId

                        INNER JOIN Proof..RoleMaster rm

                            ON rm.RoleID =
                               orm.RoleID

                        WHERE

                            oum.UserId = @UserID

                        AND oum.IsActive = 1

                        AND rm.RoleName =
                            'TransportOffice'

                    )

                    AND BookingStatus IN (

                        'Submitted',
                        'Verified',
                        'Approved',
                        'Rejected',
                        'Allocated',
                        'Vehicle Unavailable'

                    )

                `);


        console.log(
            "Transport Allocator Dashboard Result:",
            result.recordset[0]
        );


        return res.status(200).json({

            success: true,

            data:
                result.recordset[0]

        });

    }

    catch (err) {

        console.error(
            "Transport allocator dashboard counts error:",
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
GET TRANSPORT ALLOCATOR APPLICATIONS
=========================================================
*/

exports.getApplications = async (req, res) => {

    try {

        console.log(
            "========== TRANSPORT ALLOCATOR APPLICATION =========="
        );

        console.log(
            "Booking ID:",
            req.params.bookingId
        )


        const currentUser =
            getCurrentUser(req);


        console.log(
            "Current User:",
            currentUser
        );


        if (!currentUser) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication failed"

            });

        }


        const userId =
            Number(currentUser.UserId);


        if (!Number.isFinite(userId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid UserId."

            });

        }


        const pool =
            await poolPromise;


        /*
        -----------------------------------------------------
        Get TransportOffice RoleMapId(s)
        -----------------------------------------------------
        */

        const roleResult =
            await pool.request()

                .input(
                    "UserID",
                    sql.BigInt,
                    userId
                )

                .query(`

                    SELECT DISTINCT

                        oum.RoleMapId

                    FROM Proof..OrgUnitUserMapping oum

                    INNER JOIN Proof..OrgUnitRoleMapping orm

                        ON orm.RoleMapID =
                           oum.RoleMapId

                    INNER JOIN Proof..RoleMaster rm

                        ON rm.RoleID =
                           orm.RoleID

                    WHERE

                        oum.UserId = @UserID

                    AND oum.IsActive = 1

                    AND rm.RoleName =
                        'TransportOffice'

                `);


        const transportOfficeRoleMapIds =
            roleResult.recordset.map(
                row => Number(row.RoleMapId)
            );


        console.log(
            "TransportOffice RoleMapIDs:",
            transportOfficeRoleMapIds
        );


        if (
            transportOfficeRoleMapIds.length === 0
        ) {

            return res.status(200).json({

                success: true,

                count: 0,

                data: []

            });

        }


        /*
        -----------------------------------------------------
        Optional actionRequired filter
        -----------------------------------------------------
        */

        const actionRequired =
            String(
                req.query.actionRequired
            ).toLowerCase() === "true";


        /*
        -----------------------------------------------------
        Applications
        -----------------------------------------------------
        */

        const request =
            pool.request()

                .input(
                    "UserID",
                    sql.BigInt,
                    userId
                );


        let query = `

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

                b.ExpenditureHead,

                b.ProjectNo,

                b.BookedBy,

                b.BookingDateTime,

                b.BookingStatus,

                b.AssignedApproverID,

                b.AssignedTransportOfficeID

            FROM TransportBookings b

            WHERE

                b.IsActive = 1

            AND b.AssignedTransportOfficeID IN (

                SELECT DISTINCT

                    oum.RoleMapId

                FROM Proof..OrgUnitUserMapping oum

                INNER JOIN Proof..OrgUnitRoleMapping orm

                    ON orm.RoleMapID =
                       oum.RoleMapId

                INNER JOIN Proof..RoleMaster rm

                    ON rm.RoleID =
                       orm.RoleID

                WHERE

                    oum.UserId = @UserID

                AND oum.IsActive = 1

                AND rm.RoleName =
                    'TransportOffice'

            )

        `;


        /*
        -----------------------------------------------------
        Pending allocation
        -----------------------------------------------------
        */

        if (actionRequired) {

            query += `

                AND b.BookingStatus =
                    'Approved'

            `;

        }


        /*
        -----------------------------------------------------
        All allocator applications
        -----------------------------------------------------
        */

        else {

            query += `

                AND b.BookingStatus IN (

                    'Submitted',
                    'Verified',
                    'Approved',
                    'Rejected',
                    'Allocated',
                    'Vehicle Unavailable'

                )

            `;

        }


        query += `

            ORDER BY
                b.BookingDateTime DESC

        `;


        const result =
            await request.query(query);


        console.log(
            "Transport Allocator Result Count:",
            result.recordset.length
        );

        console.log(
            "Transport Allocator Applications:",
            result.recordset
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
            "Transport allocator applications error:",
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
GET SINGLE TRANSPORT APPLICATION
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
         * Get booking from the Transport-specific
         * booking service.
         */

        const booking =
            await getTransportBookingDetails(
                bookingId
            );

        console.log(
            "Transport Booking Details:",
            booking
        );

        if (!booking) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."

            });

        }

        /*
         * Verify that this logged-in user belongs
         * to the Transport Office assigned to THIS
         * booking.
         */

        console.log(
            "Assigned Transport Office:",
            booking?.AssignedTransportOfficeID
        );

        console.log(
            "Current User RoleMapIDs:",
            currentUser?.RoleMapIDs
        );

        console.log(
            "Current User Roles:",
            currentUser?.Roles
        );

        AuthorizationService.ensureAssignedRole(

            booking.AssignedTransportOfficeID,

            currentUser,

            "TransportOffice"

        );

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

                        ON ebi.EmployeeId =
                           b.BookedBy

                    LEFT JOIN Proof..OrgUnitRoleMapping ov

                        ON ov.RoleMapID =
                           b.AssignedVerifierID

                    LEFT JOIN Proof..RoleMaster vr

                        ON vr.RoleID =
                           ov.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping oa

                        ON oa.RoleMapID =
                           b.AssignedApproverID

                    LEFT JOIN Proof..RoleMaster ar

                        ON ar.RoleID =
                           oa.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping ot

                        ON ot.RoleMapID =
                           b.AssignedTransportOfficeID

                    LEFT JOIN Proof..RoleMaster tr

                        ON tr.RoleID =
                           ot.RoleID

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

                message:
                    "Application not found."

            });

        }

        const application =
            bookingResult.recordset[0];

        console.log(
            "Fetching workflow history..."
        );

        application.WorkflowHistory =
            await getWorkflowHistory(
                "Transport",
                bookingId
            );

        console.log(
            "Workflow history fetched:",
            application.WorkflowHistory
        );

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

            data:
                application

        });

    }

    catch (err) {

        console.error(
            "Transport allocator get application error:",
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
ALLOCATE VEHICLE / MARK VEHICLE UNAVAILABLE
=========================================================
*/

exports.allocateVehicle = async (req, res) => {

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

        const {
            decision,
            vehicleNumber,
            remarks = ""
        } = req.body;


        /*
        =====================================================
        Validate decision
        =====================================================
        */

        const allowedDecisions = [

            "Allocated",
            "Vehicle Unavailable"

        ];

        if (
            !allowedDecisions.includes(
                decision
            )
        ) {

            await transaction.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Invalid allocation decision."

            });

        }


        /*
        =====================================================
        Vehicle number mandatory when allocated
        =====================================================
        */

        if (
            decision === "Allocated" &&
            !String(
                vehicleNumber || ""
            ).trim()
        ) {

            await transaction.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Allocated vehicle is required."

            });

        }


        /*
        =====================================================
        Remarks mandatory when vehicle unavailable
        =====================================================
        */

        if (
            decision === "Vehicle Unavailable" &&
            !String(
                remarks || ""
            ).trim()
        ) {

            await transaction.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Remarks are required when the vehicle is unavailable."

            });

        }


        /*
        =====================================================
        Get booking
        =====================================================
        */

        const booking =
            await getTransportBookingDetails(
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
        =====================================================
        Only Approved applications can be allocated
        =====================================================
        */

        AuthorizationService.ensureBookingStatus(

            booking,

            "Approved"

        );


        /*
        =====================================================
        Verify Transport Office assignment

        ensureAssignedRole is async, so await it.
        =====================================================
        */

        await AuthorizationService.ensureAssignedRole(

            booking.AssignedTransportOfficeID,

            currentUser,

            "TransportOffice"

        );


        /*
        =====================================================
        Prepare workflow remarks
        =====================================================
        */

        let workflowRemarks =
            String(
                remarks || ""
            ).trim();


        if (
            decision === "Allocated"
        ) {

            workflowRemarks =
                `Vehicle: ${String(
                    vehicleNumber
                ).trim()}`
                +
                (
                    workflowRemarks
                        ? ` | Remarks: ${workflowRemarks}`
                        : ""
                );

        }


        /*
        =====================================================
        Update workflow
        =====================================================
        */

        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                moduleName:
                    "Transport",

                previousStatus:
                    booking.BookingStatus,

                currentStatus:
                    decision,

                actionName:
                    decision === "Allocated"
                        ? "Allocate Vehicle"
                        : "Vehicle Unavailable",

                authorityRole:
                    "TransportOffice",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks:
                    workflowRemarks

            }

        );


        /*
        =====================================================
        COMMIT
        =====================================================
        */

        await transaction.commit();


        /*
        =====================================================
        SEND EMAIL AFTER COMMIT

        Only send allocation email when a vehicle
        was actually allocated.
        =====================================================
        */

        if (
            decision === "Allocated"
        ) {

            try {

                /*
                -------------------------------------------------
                Get applicant employee details
                -------------------------------------------------
                */

                const employee =
                    await getEmployeeById(
                        booking.BookedBy
                    );


                /*
                -------------------------------------------------
                Send notification
                -------------------------------------------------
                */

                await NotificationService
                    .sendTransportVehicleAllocated(

                        /*
                        TO
                        Traveller
                        */

                        booking.TravellerEmailID,


                        /*
                        CC
                        Applicant / employee
                        */

                        employee?.EmployeeEmail ||
                        employee?.PrimaryMail ||
                        employee?.Email ||
                        null,


                        /*
                        Template data
                        */

                        {

                            TransportBookingNo:
                                booking.TransportBookingNo,

                            TravellerName:
                                booking.TravellerName,

                            DepartureLocation:
                                booking.DepartureLocation,

                            ArrivalLocation:
                                booking.ArrivalLocation,

                            DepartureDateTime:
                                booking.DepartureDateTime,

                            ArrivalDateTime:
                                booking.ArrivalDateTime,

                            VehicleNumber:
                                String(
                                    vehicleNumber
                                ).trim(),

                            Remarks:
                                remarks

                        }

                    );


                console.log(
                    "Transport vehicle allocation email sent successfully."
                );

            }

            catch (emailError) {

                /*
                -------------------------------------------------
                Email failure must NOT undo allocation
                -------------------------------------------------
                */

                console.error(
                    "Transport vehicle allocation email failed:",
                    emailError
                );

            }

        }


        /*
        =====================================================
        RESPONSE
        =====================================================
        */

        return res.status(200).json({

            success: true,

            message:
                decision === "Allocated"

                    ? "Vehicle allocated successfully."

                    : "Vehicle unavailable decision submitted successfully."

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
                "Allocation rollback error:",
                rollbackError
            );

        }

        console.error(
            "Transport vehicle allocation error:",
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