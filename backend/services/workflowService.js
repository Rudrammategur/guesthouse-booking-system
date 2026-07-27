const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {
    generateWorkflowHistoryId
} = require("../utils/idGenerator");


/*
---------------------------------------------------------
Workflow Users
---------------------------------------------------------
*/

exports.getWorkflowUsers = async () => {

    const pool = await poolPromise;

    const result = await pool.request().query(`

        SELECT *

        FROM GuestHouseUserAccess

        WHERE IsActive=1

    `);

    return result.recordset;

};


/*
---------------------------------------------------------
Update Booking Status
---------------------------------------------------------
*/

exports.updateBookingStatus = async (

    transaction,

    bookingId,

    status,

    employeeId

) => {

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
            employeeId
        )

        .query(`

UPDATE GuestHouseRoomBookings

SET

BookingStatus=@Status,

ActivityBy=@EmployeeID

WHERE

GHBookingID=@BookingID

`);

};


/*
---------------------------------------------------------
Get Workflow History
---------------------------------------------------------
*/

exports.getWorkflowHistory = async (

    moduleName,

    referenceId

) => {

    const pool = await poolPromise;

    const result = await pool.request()

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

ModuleName=@ModuleName

AND

ReferenceID=@ReferenceID

AND

IsActive=1

ORDER BY

SequenceNo,
ActionDateTime

`);

    return result.recordset;

};


/*
---------------------------------------------------------
Get Next Sequence No
---------------------------------------------------------
*/

exports.getNextSequenceNo = async (

    transaction,

    moduleName,

    referenceId

) => {

    const result = await new sql.Request(transaction)

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

ISNULL(MAX(SequenceNo),0)+1 AS NextSequence

FROM WorkflowHistory

WHERE

ModuleName=@ModuleName

AND

ReferenceID=@ReferenceID

`);

    return result.recordset[0].NextSequence;

};


/*
---------------------------------------------------------
Insert Workflow History
---------------------------------------------------------
*/

exports.insertWorkflowHistory = async (
    transaction,
    history
) => {

    const sequenceResult =
        await new sql.Request(transaction)

            .input(
                "ModuleName",
                sql.VarChar,
                history.moduleName
            )

            .input(
                "ReferenceID",
                sql.VarChar,
                history.referenceId
            )

            .query(`

SELECT
    ISNULL(MAX(SequenceNo),0)+1 AS NextSequenceNo
FROM WorkflowHistory
WHERE
    ModuleName=@ModuleName
AND
    ReferenceID=@ReferenceID

`);

    const nextSequenceNo =
        sequenceResult.recordset[0].NextSequenceNo;

    await new sql.Request(transaction)

        .input(
            "WorkflowHistoryID",
            sql.VarChar,
            generateWorkflowHistoryId()
        )

        .input(
            "ModuleName",
            sql.VarChar,
            history.moduleName
        )

        .input(
            "ReferenceID",
            sql.VarChar,
            history.referenceId
        )

        .input(
            "SequenceNo",
            sql.Int,
            nextSequenceNo
        )

        .input(
            "PreviousStatus",
            sql.VarChar,
            history.previousStatus
        )

        .input(
            "CurrentStatus",
            sql.VarChar,
            history.currentStatus
        )

        .input(
            "ActionName",
            sql.VarChar,
            history.actionName
        )

        .input(
            "AuthorityRole",
            sql.VarChar,
            history.authorityRole
        )

        .input(
            "AuthorityName",
            sql.NVarChar,
            history.authorityName
        )

        .input(
            "ActionBy",
            sql.VarChar,
            history.actionBy
        )

        .input(
            "ActionDateTime",
            sql.DateTime,
            new Date()
        )

        .input(
            "Remarks",
            sql.NVarChar,
            history.remarks || ""
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
    @ActionDateTime,
    @Remarks,
    1,
    GETDATE()
)

`);

};


/*
---------------------------------------------------------
Change Workflow Status
---------------------------------------------------------
*/

exports.changeWorkflowStatus = async (
    transaction,
    {
        bookingId,
        moduleName = "GuestHouseBooking",
        previousStatus,
        currentStatus,
        actionName,
        authorityRole,
        authorityName,
        actionBy,
        remarks = ""
    }
) => {

    // Update Booking Status
    await exports.updateBookingStatus(
        transaction,
        bookingId,
        currentStatus,
        actionBy
    );

    // Insert Workflow History
    await exports.insertWorkflowHistory(
        transaction,
        {
            moduleName,
            referenceId: bookingId,
            previousStatus,
            currentStatus,
            actionName,
            authorityRole,
            authorityName,
            actionBy,
            remarks
        }
    );

};