const sql = require("mssql");

const { poolPromise } =
    require("../config/db");

const {
    generateWorkflowHistoryId
} = require("../utils/idGenerator");


/*
==================================================
Workflow Users
==================================================
*/

exports.getWorkflowUsers = async () => {

    const pool =
        await poolPromise;

    const result =
        await pool.request().query(`

            SELECT *

            FROM GuestHouseUserAccess

            WHERE IsActive = 1

        `);

    return result.recordset;

};


/*
==================================================
Update Booking Status
==================================================
*/

exports.updateBookingStatus = async (

    transaction,

    {
        moduleName = "GuestHouse",

        bookingId,

        status,

        employeeId

    }

) => {

    let tableName;
    let bookingIdColumn;


    /*
    ==============================================
    Module-specific configuration
    ==============================================
    */

    switch (moduleName) {

        case "GuestHouse":

            tableName =
                "GuestHouseRoomBookings";

            bookingIdColumn =
                "GHBookingID";

            break;


        case "Transport":

            tableName =
                "TransportBookings";

            bookingIdColumn =
                "TransportBookingID";

            break;


        default:

            throw new Error(
                `Unsupported workflow module: ${moduleName}`
            );

    }


    /*
    ==============================================
    Update Status
    ==============================================
    */

    const query = `

        UPDATE ${tableName}

        SET

            BookingStatus = @Status,

            ActivityBy = @EmployeeID

        WHERE

            ${bookingIdColumn} = @BookingID

    `;

    console.log("========== updateBookingStatus DEBUG ==========");
    console.log("moduleName:", moduleName);
    console.log("bookingId:", bookingId, typeof bookingId);
    console.log("status:", status, typeof status);
    console.log("employeeId:", employeeId);
    console.log("employeeId type:", typeof employeeId);
    console.log("employeeId constructor:", employeeId?.constructor?.name);
    console.log("employeeId JSON:", JSON.stringify(employeeId));
    console.log("==============================================");


    const normalizedEmployeeId =
        employeeId == null
            ? null
            : String(employeeId);

    await new sql.Request(transaction)
        .input(
            "BookingID",
            sql.VarChar,
            bookingId
        )
        .input(
            "Status",
            sql.VarChar,
            status
        )
        .input(
            "EmployeeID",
            sql.VarChar,
            normalizedEmployeeId
        )
        .query(query);

};


/*
==================================================
Get Workflow History
==================================================
*/

exports.getWorkflowHistory = async (

    moduleName,

    referenceId

) => {

    const pool =
        await poolPromise;

    const result =
        await pool.request()

            .input(
                "ModuleName",
                sql.VarChar,
                moduleName
            )

            .input(
                "ReferenceID",
                sql.VarChar,
                referenceId
            )

            .query(`

                SELECT

                    WorkflowHistoryID,

                    SequenceNo,

                    PreviousStatus,

                    CurrentStatus,

                    ActionName,

                    AuthorityRole,

                    AuthorityName,

                    ActionBy,

                    ActionDateTime,

                    Remarks

                FROM WorkflowHistory

                WHERE

                    ModuleName = @ModuleName

                AND

                    ReferenceID = @ReferenceID

                AND

                    IsActive = 1

                ORDER BY

                    SequenceNo,

                    ActionDateTime

            `);

    return result.recordset;

};


/*
==================================================
Get Next Sequence No
==================================================
*/

exports.getNextSequenceNo = async (

    transaction,

    moduleName,

    referenceId

) => {

    const result =
        await new sql.Request(transaction)

            .input(
                "ModuleName",
                sql.VarChar,
                moduleName
            )

            .input(
                "ReferenceID",
                sql.VarChar,
                referenceId
            )

            .query(`

                SELECT

                    ISNULL(
                        MAX(SequenceNo),
                        0
                    ) + 1 AS NextSequence

                FROM WorkflowHistory

                WHERE

                    ModuleName = @ModuleName

                AND

                    ReferenceID = @ReferenceID

            `);

    return result.recordset[0]
        .NextSequence;

};


/*
==================================================
Insert Workflow History
==================================================
*/

exports.insertWorkflowHistory = async (

    transaction,

    {

        moduleName,

        referenceId,

        previousStatus,

        currentStatus,

        actionName,

        authorityRole,

        authorityName,

        actionBy,

        remarks = "",

        ipAddress = null,

        deviceInfo = null

    }

) => {

    const workflowHistoryId =
        await generateWorkflowHistoryId(
            transaction
        );


    const sequenceNo =
        await exports.getNextSequenceNo(

            transaction,

            moduleName,

            referenceId

        );

    
    const normalizedActionBy =
    actionBy == null
        ? null
        : String(actionBy);


    await new sql.Request(transaction)

        .input(
            "WorkflowHistoryID",
            sql.VarChar,
            workflowHistoryId
        )

        .input(
            "ModuleName",
            sql.VarChar,
            moduleName
        )

        .input(
            "ReferenceID",
            sql.VarChar,
            referenceId
        )

        .input(
            "SequenceNo",
            sql.Int,
            sequenceNo
        )

        .input(
            "PreviousStatus",
            sql.VarChar,
            previousStatus
        )

        .input(
            "CurrentStatus",
            sql.VarChar,
            currentStatus
        )

        .input(
            "ActionName",
            sql.VarChar,
            actionName
        )

        .input(
            "AuthorityRole",
            sql.VarChar,
            authorityRole
        )

        .input(
            "AuthorityName",
            sql.VarChar,
            authorityName
        )

        .input(
            "ActionBy",
            sql.VarChar,
            normalizedActionBy
        )

        .input(
            "Remarks",
            sql.NVarChar,
            remarks
        )

        .input(
            "IPAddress",
            sql.VarChar,
            ipAddress
        )

        .input(
            "DeviceInfo",
            sql.NVarChar,
            deviceInfo
        )

        .query(`

            INSERT INTO WorkflowHistory
            (
                WorkflowHistoryID,

                ModuleName,

                ReferenceID,

                SequenceNo,

                PreviousStatus,

                CurrentStatus,

                ActionName,

                AuthorityRole,

                AuthorityName,

                ActionBy,

                ActionDateTime,

                Remarks,

                IPAddress,

                DeviceInfo,

                IsActive,

                CreatedDate
            )

            VALUES
            (
                @WorkflowHistoryID,

                @ModuleName,

                @ReferenceID,

                @SequenceNo,

                @PreviousStatus,

                @CurrentStatus,

                @ActionName,

                @AuthorityRole,

                @AuthorityName,

                @ActionBy,

                GETDATE(),

                @Remarks,

                @IPAddress,

                @DeviceInfo,

                1,

                GETDATE()
            )

        `);

};


/*
==================================================
Change Workflow Status
==================================================
*/

exports.changeWorkflowStatus = async (

    transaction,

    {

        bookingId,

        moduleName = "GuestHouse",

        previousStatus,

        currentStatus,

        actionName,

        authorityRole,

        authorityName,

        actionBy,

        remarks = "",

        ipAddress = null,

        deviceInfo = null

    }

) => {


    /*
    ==============================================
    1. Update actual application
    ==============================================
    */

    await exports.updateBookingStatus(

        transaction,

        {

            moduleName,

            bookingId,

            status:
                currentStatus,

            employeeId:
                actionBy

        }

    );


    /*
    ==============================================
    2. Insert workflow history
    ==============================================
    */

    await exports.insertWorkflowHistory(

        transaction,

        {

            moduleName,

            referenceId:
                bookingId,

            previousStatus,

            currentStatus,

            actionName,

            authorityRole,

            authorityName,

            actionBy,

            remarks,

            ipAddress,

            deviceInfo

        }

    );

};