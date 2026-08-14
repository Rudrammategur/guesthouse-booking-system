const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {
    generateTransportBookingId,
    generateTransportBookingNo
} = require("../utils/idGenerator");

const getCurrentUser = require("../utils/getCurrentUser");

const WorkflowResolverService =
    require("../services/WorkflowResolverService");

const {
    insertWorkflowHistory
} = require("../services/workflowService");


const {
    getSupportingDocument
} = require("../services/DocumentService");

const AuthorizationService =
    require("../services/AuthorizationService");

const {
    getTransportBookingDetails
} = require("../services/bookingService");


// =========================================================
// CREATE TRANSPORT BOOKING
// =========================================================

exports.createBooking = async (req, res) => {

    const pool = await poolPromise;

    const transaction =
        new sql.Transaction(pool);

    try {

        // -------------------------------------------------
        // Request data
        // -------------------------------------------------

        const data = req.body;

        console.log(
            "Transport Booking Request:",
            data
        );


        // -------------------------------------------------
        // Current user
        // -------------------------------------------------

        const currentUser = getCurrentUser(req);

        if (!currentUser) {

            return res.status(401).json({
                success: false,
                message: "User authentication failed"
            });

        }

        console.log(
            "Transport Current User:",
            currentUser
        );


        // -------------------------------------------------
        // Applicant role
        // -------------------------------------------------

        const applicantRole =
            currentUser.Roles?.find(
                role =>
                    role.RoleName ===
                    "IITDH EMPLOYEES"
            );


        if (!applicantRole) {

            throw new Error(
                "Applicant role not found."
            );

        }


        // -------------------------------------------------
        // Resolve workflow
        // -------------------------------------------------

        const workflow =
            await WorkflowResolverService.resolveWorkflow(
                Number(
                    applicantRole.RoleMapId
                ),
                data.expenditureHeadType ||
                data.ExpenditureHead,
                "Transport"
            );


        console.log(
            "Resolved Transport Workflow:",
            workflow
        );


        // -------------------------------------------------
        // Validate / prepare data
        // -------------------------------------------------

        const seatingCapacity =
            Number(
                data.SeatingCapacity ||
                data.vehicleCapacity
            );


        const numberOfTravellers =
            Number(
                data.numberOfTravellers ||
                data.NumberOfTravellers
            );


        if (!seatingCapacity || seatingCapacity < 1) {

            throw new Error(
                "Invalid seating capacity."
            );

        }


        if (
            !numberOfTravellers ||
            numberOfTravellers < 1
        ) {

            throw new Error(
                "Invalid number of travellers."
            );

        }


        // -------------------------------------------------
        // Project Fund validation
        // -------------------------------------------------

        const expenditureHead =
            data.expenditureHeadType ||
            data.ExpenditureHead ||
            "";


        const projectNo =
            data.projectDetails ||
            data.ProjectNo ||
            null;


        if (
            expenditureHead === "Project Fund" &&
            !projectNo
        ) {

            throw new Error(
                "Project is required for Project Fund."
            );

        }


        // -------------------------------------------------
        // Begin transaction
        // -------------------------------------------------

        await transaction.begin();


        // -------------------------------------------------
        // Generate IDs
        // -------------------------------------------------

        const bookingID =
            await generateTransportBookingId(
                transaction
            );


        const bookingNo =
            await generateTransportBookingNo(
                transaction
            );


        console.log(
            "Transport Booking ID:",
            bookingID
        );

        console.log(
            "Transport Booking No:",
            bookingNo
        );


        // -------------------------------------------------
        // Insert Transport Booking
        // -------------------------------------------------

        const request =
            transaction.request();

        const departureDate = new Date(data.DepartureDateTime);
        const arrivalDate = new Date(data.ArrivalDateTime);

        console.log("Parsed Departure Date:", departureDate);
        console.log("Parsed Arrival Date:", arrivalDate);

        if (isNaN(departureDate.getTime())) {
            throw new Error("Invalid Departure DateTime.");
        }

        if (isNaN(arrivalDate.getTime())) {
            throw new Error("Invalid Arrival DateTime.");
        }

        if (arrivalDate <= departureDate) {
            throw new Error(
                "Arrival DateTime must be after Departure DateTime."
            );
        }


        await request

            .input(
                "TransportBookingID",
                sql.VarChar,
                bookingID
            )

            .input(
                "TransportBookingNo",
                sql.VarChar,
                bookingNo
            )

            .input(
                "SeatingCapacity",
                sql.Int,
                seatingCapacity
            )

            .input(
                "BookingType",
                sql.VarChar,
                data.BookingType
            )

            .input(
                "TravellerName",
                sql.VarChar,
                data.TravellerName
            )

            .input(
                "TravellerAddress",
                sql.VarChar,
                data.TravellerAddress
            )

            .input(
                "TravellerContactNo",
                sql.VarChar,
                data.TravellerContactNo ||
                `${data.CountryCode || "+91"}${data.TravellerMobile || ""}`
            )

            .input(
                "TravellerEmailID",
                sql.VarChar,
                data.TravellerEmailID
            )

            .input(
                "NumberOfTravellers",
                sql.Int,
                numberOfTravellers
            )

            .input(
                "DepartureLocation",
                sql.VarChar,
                data.DepartureLocation
            )

            .input(
                "ArrivalLocation",
                sql.VarChar,
                data.ArrivalLocation
            )

            .input(
                "DepartureDateTime",
                sql.DateTime,
                departureDate
            )

            .input(
                "ArrivalDateTime",
                sql.DateTime,
                arrivalDate
            )

            .input(
                "PurposeOfTravel",
                sql.VarChar,
                data.PurposeOfTravel
            )

            .input(
                "AdditionalInfo",
                sql.VarChar,
                data.AdditionalInfo || null
            )

            .input(
                "ExpenditureHead",
                sql.VarChar,
                expenditureHead
            )

            .input(
                "ProjectNo",
                sql.VarChar,
                projectNo
            )

            .input(
                "SupportingDoc",
                sql.VarBinary(sql.MAX),
                req.file
                    ? req.file.buffer
                    : null
            )

            .input(
                "SupportingDocName",
                sql.NVarChar,
                req.file
                    ? req.file.originalname
                    : data.uploadedFileName ||
                    null
            )

            .input(
                "SupportingDocMimeType",
                sql.VarChar,
                req.file
                    ? req.file.mimetype
                    : null
            )

            .input(
                "BookedBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .input(
                "BookingDateTime",
                sql.DateTime,
                new Date()
            )

            .input(
                "BookingStatus",
                sql.VarChar,
                "Submitted"
            )

            .input(
                "ActivityBy",
                sql.VarChar,
                currentUser.EmployeeId
            )

            .input(
                "AssignedVerifierID",
                sql.VarChar,
                workflow.verifierRoleMapID
                    ? workflow.verifierRoleMapID.toString()
                    : null
            )

            .input(
                "AssignedApproverID",
                sql.VarChar,
                workflow.approverRoleMapID
                    ? workflow.approverRoleMapID.toString()
                    : null
            )

            .input(
                "AssignedTransportOfficeID",
                sql.VarChar,
                workflow.allocatorRoleMapID
                    ? workflow.allocatorRoleMapID.toString()
                    : null
            )

            .query(`

                INSERT INTO TransportBookings
                (
                    TransportBookingID,
                    TransportBookingNo,

                    SeatingCapacity,
                    BookingType,

                    TravellerName,
                    TravellerAddress,
                    TravellerContactNo,
                    TravellerEmailID,
                    NumberOfTravellers,

                    DepartureLocation,
                    ArrivalLocation,
                    DepartureDateTime,
                    ArrivalDateTime,

                    PurposeOfTravel,
                    AdditionalInfo,

                    ExpenditureHead,
                    ProjectNo,

                    SupportingDoc,
                    SupportingDocName,
                    SupportingDocMimeType,

                    BookedBy,
                    BookingDateTime,

                    BookingStatus,
                    ActivityBy,

                    AssignedVerifierID,
                    AssignedApproverID,
                    AssignedTransportOfficeID,

                    IsActive
                )

                VALUES
                (
                    @TransportBookingID,
                    @TransportBookingNo,

                    @SeatingCapacity,
                    @BookingType,

                    @TravellerName,
                    @TravellerAddress,
                    @TravellerContactNo,
                    @TravellerEmailID,
                    @NumberOfTravellers,

                    @DepartureLocation,
                    @ArrivalLocation,
                    @DepartureDateTime,
                    @ArrivalDateTime,

                    @PurposeOfTravel,
                    @AdditionalInfo,

                    @ExpenditureHead,
                    @ProjectNo,

                    @SupportingDoc,
                    @SupportingDocName,
                    @SupportingDocMimeType,

                    @BookedBy,
                    @BookingDateTime,

                    @BookingStatus,
                    @ActivityBy,

                    @AssignedVerifierID,
                    @AssignedApproverID,
                    @AssignedTransportOfficeID,

                    1
                )

            `);


        // -------------------------------------------------
        // Verify insertion
        // -------------------------------------------------

        const checkBooking =
            await new sql.Request(
                transaction
            )

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingID
                )

                .query(`

                    SELECT
                        TransportBookingID,
                        TransportBookingNo,
                        TravellerName,
                        BookingStatus,
                        BookedBy

                    FROM dbo.TransportBookings

                    WHERE
                        TransportBookingID =
                        @BookingID

                `);


        console.log(
            "Inserted Transport Booking:",
            checkBooking.recordset
        );


        // -------------------------------------------------
        // Workflow history
        // -------------------------------------------------

        await insertWorkflowHistory(
            transaction,
            {
                moduleName:
                    "Transport",

                referenceId:
                    bookingID,

                previousStatus:
                    "",

                currentStatus:
                    "Submitted",

                actionName:
                    "Submit",

                authorityRole:
                    "Applicant",

                authorityName:
                    currentUser.EmployeeName,

                actionBy:
                    currentUser.EmployeeId,

                remarks:
                    ""
            }
        );


        // -------------------------------------------------
        // Commit
        // -------------------------------------------------

        await transaction.commit();


        // -------------------------------------------------
        // Response
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            BookingID:
                bookingID,

            BookingNo:
                bookingNo,

            message:
                "Transport booking submitted successfully"

        });

    }

    catch (error) {

        console.error(
            "Transport Booking Error:",
            error
        );


        if (
            transaction._aborted !== true
        ) {

            try {

                await transaction.rollback();

            }

            catch (rollbackError) {

                console.error(
                    "Rollback failed:",
                    rollbackError.message
                );

            }

        }


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


exports.getDashboardCounts = async (req, res) => {

    try {

        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            throw new Error("User authentication failed");
        }

        const employeeId = currentUser.EmployeeId;

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "EmployeeId",
                sql.VarChar,
                employeeId
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
                    ) AS Submitted,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Verified'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS Verified,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Approved'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS Approved,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Rejected'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS Rejected,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Completed'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS Completed,

                    ISNULL(
                        SUM(
                            CASE
                                WHEN BookingStatus = 'Cancelled'
                                THEN 1
                                ELSE 0
                            END
                        ),
                        0
                    ) AS Cancelled

                FROM ContractServices.dbo.TransportBookings

                WHERE

                    IsActive = 1

                    AND BookedBy = @EmployeeId

            `);

        return res.status(200).json({

            success: true,

            data: result.recordset[0]

        });

    }

    catch (err) {

        console.error(
            "Transport dashboard counts error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


exports.getMyApplications = async (req, res) => {

    try {

        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            throw new Error("User authentication failed");
        }

        const employeeId = currentUser.EmployeeId;

        const pool = await poolPromise;

        const result = await pool.request()

            .input(
                "EmployeeId",
                sql.VarChar,
                employeeId
            )

            .query(`

                SELECT

                    b.TransportBookingID,

                    b.TransportBookingNo,

                    b.SeatingCapacity,

                    b.BookingType,

                    b.TravellerName,

                    b.TravellerAddress,

                    b.TravellerContactNo,

                    b.TravellerEmailID,

                    b.NumberOfTravellers,

                    b.DepartureLocation,

                    b.ArrivalLocation,

                    b.DepartureDateTime,

                    b.ArrivalDateTime,

                    b.PurposeOfTravel,

                    b.AdditionalInfo,

                    b.ExpenditureHead,

                    b.ProjectNo,

                    b.SupportingDocName,

                    b.SupportingDocMimeType,

                    b.BookedBy,

                    b.BookingDateTime,

                    b.BookingStatus

                FROM ContractServices.dbo.TransportBookings b

                WHERE

                    b.IsActive = 1

                    AND b.BookedBy = @EmployeeId

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
            "Transport applications error:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.getApplicationDetails = async (req, res) => {

    try {

        const pool = await poolPromise;

        const currentUser = getCurrentUser(req);

        if (!currentUser) {
            throw new Error("User authentication failed");
        }

        const employeeId = currentUser.EmployeeId;
        const bookingId = req.params.bookingId;

        const result = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

                SELECT

                    TransportBookingID,
                    TransportBookingNo,
                    SeatingCapacity,
                    BookingType,

                    TravellerName,
                    TravellerAddress,
                    TravellerContactNo,
                    TravellerEmailID,
                    NumberOfTravellers,

                    DepartureLocation,
                    ArrivalLocation,

                    DepartureDateTime,
                    ArrivalDateTime,

                    PurposeOfTravel,
                    AdditionalInfo,

                    ExpenditureHead,
                    ProjectNo,

                    SupportingDocName,
                    SupportingDocMimeType,

                    BookedBy,
                    BookingDateTime,
                    BookingStatus,

                    AssignedVerifierID,
                    AssignedApproverID,
                    AssignedTransportOfficeID

                FROM TransportBookings

                WHERE
                    TransportBookingID = @BookingID
                    AND IsActive = 1

            `);

        if (result.recordset.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Transport booking not found."

            });

        }

        const booking = result.recordset[0];

        // Applicant ownership validation
        if (
            String(booking.BookedBy) !==
            String(employeeId)
        ) {

            return res.status(403).json({

                success: false,
                message:
                    "Only the applicant can view this application."

            });

        }

        return res.status(200).json({

            success: true,

            data: {

                header: {

                    bookingId:
                        booking.TransportBookingID,

                    bookingNo:
                        booking.TransportBookingNo,

                    status:
                        booking.BookingStatus

                },

                application: booking

            }

        });

    }

    catch (err) {

        console.error(
            "Transport getApplicationDetails error:",
            err
        );

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

exports.cancelBooking = async (req, res) => {

    const transaction =
        new sql.Transaction(await poolPromise);

    try {

        await transaction.begin();

        const bookingId =
            req.params.bookingId;

        const remarks =
            req.body?.remarks || "";

        const currentUser =
            getCurrentUser(req);

        if (!currentUser) {

            throw new Error(
                "User authentication failed"
            );

        }

        const employeeId =
            currentUser.EmployeeId;


        // ------------------------------------------------
        // Get booking
        // ------------------------------------------------

        const bookingResult =
            await new sql.Request(transaction)

                .input(
                    "BookingID",
                    sql.VarChar,
                    bookingId
                )

                .query(`

                    SELECT *

                    FROM TransportBookings

                    WHERE
                        TransportBookingID = @BookingID
                        AND IsActive = 1

                `);


        if (
            bookingResult.recordset.length === 0
        ) {

            await transaction.rollback();

            return res.status(404).json({

                success: false,
                message: "Transport booking not found."

            });

        }


        const booking =
            bookingResult.recordset[0];


        // ------------------------------------------------
        // Ownership validation
        // ------------------------------------------------

        if (
            String(booking.BookedBy) !==
            String(employeeId)
        ) {

            await transaction.rollback();

            return res.status(403).json({

                success: false,

                message:
                    "Only the applicant can cancel this application."

            });

        }


        // ------------------------------------------------
        // Status validation
        // ------------------------------------------------

        const nonCancellableStatuses = [
            "Cancelled",
            "Completed",
            "Rejected",
            "Allocated"
        ];

        if (
            nonCancellableStatuses.includes(
                booking.BookingStatus
            )
        ) {

            await transaction.rollback();

            return res.status(400).json({

                success: false,

                message:
                    `Application cannot be cancelled when status is ${booking.BookingStatus}.`

            });

        }


        // ------------------------------------------------
        // Update booking
        // ------------------------------------------------

        await new sql.Request(transaction)

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .input(
                "EmployeeID",
                sql.VarChar,
                employeeId
            )

            .query(`

                UPDATE TransportBookings

                SET

                    BookingStatus = 'Cancelled',

                    ActivityBy = @EmployeeID

                WHERE

                    TransportBookingID = @BookingID

            `);


        // ------------------------------------------------
        // Commit
        // ------------------------------------------------

        await transaction.commit();


        return res.status(200).json({

            success: true,

            message:
                "Transport booking cancelled successfully."

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
            "Transport cancelBooking error:",
            err
        );

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


exports.getSupportingDocument = async (req, res) => {

    try {

        const pool = await poolPromise;

        const {
            buffer,
            mimeType
        } = await getSupportingDocument({

            pool,
            sql,

            tableName:
                "TransportBookings",

            idColumn:
                "TransportBookingID",

            idValue:
                req.params.bookingId,

            documentColumn:
                "SupportingDoc"

        });

        res.setHeader(
            "Content-Type",
            mimeType
        );

        res.setHeader(
            "Content-Disposition",
            "inline"
        );

        res.send(buffer);

    }
    catch (error) {

        console.error(
            "Transport supporting document retrieval error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Unable to retrieve document"

        });

    }
};

exports.getPrintApplication = async (req, res) => {

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
            await getTransportBookingDetails(
                bookingId
            );

        if (!booking) {

            return res.status(404).json({
                success: false,
                message: "Application not found."
            });

        }

        /*
        -------------------------------------------------
        Print access
        Applicant
        Verifier
        Approver
        Transport Office
        -------------------------------------------------
        */

        const userRoleMapIds =
            await AuthorizationService.getUserRoleMapIds(
                currentUser
            );

        const hasApplicantAccess =
            booking.BookedBy ===
            currentUser.EmployeeId;

        const hasVerifierAccess =
            userRoleMapIds.includes(
                Number(booking.AssignedVerifierID)
            );

        const hasApproverAccess =
            userRoleMapIds.includes(
                Number(booking.AssignedApproverID)
            );

        const hasTransportOfficeAccess =
            userRoleMapIds.includes(
                Number(booking.AssignedTransportOfficeID)
            );

        const hasAccess =
            hasApplicantAccess ||
            hasVerifierAccess ||
            hasApproverAccess ||
            hasTransportOfficeAccess;

        if (!hasAccess) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to print this application."
            });

        }

        const pool =
            await poolPromise;

        const result =
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
                        ON ov.RoleMapID = b.AssignedVerifierID

                    LEFT JOIN Proof..RoleMaster vr
                        ON vr.RoleID = ov.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping oa
                        ON oa.RoleMapID = b.AssignedApproverID

                    LEFT JOIN Proof..RoleMaster ar
                        ON ar.RoleID = oa.RoleID

                    LEFT JOIN Proof..OrgUnitRoleMapping ot
                        ON ot.RoleMapID = b.AssignedTransportOfficeID

                    LEFT JOIN Proof..RoleMaster tr
                        ON tr.RoleID = ot.RoleID

                    WHERE
                        b.TransportBookingID = @BookingID

                    AND b.IsActive = 1

                `);

        if (!result.recordset.length) {

            return res.status(404).json({
                success: false,
                message: "Application not found."
            });

        }

        return res.status(200).json({
            success: true,
            data: result.recordset[0]
        });

    }

    catch (err) {

        console.error(
            "Transport print application error:",
            err
        );

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

};