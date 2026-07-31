const sql = require("mssql");
const { poolPromise } = require("../config/db");
const {
    getWorkflowHistory,
    changeWorkflowStatus
} = require("../services/WorkflowService");

const {
    getBookingDetails
} = require("../services/bookingService");


const { getEmployeeById } = require("../services/employeeService");
const { formatDate } = require("../utils/dateFormater");


exports.getDashboardCounts = async (req, res) => {

    try {

        const pool = await poolPromise;

        const result = await pool.request()

            .query(`

SELECT

COUNT(*) AS TotalApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Submitted'
THEN 1
ELSE 0
END
),0) AS PendingApplications,

ISNULL(SUM(
CASE
WHEN BookingStatus='Verified'
THEN 1
ELSE 0
END
),0) AS VerifiedApplications,

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
'Verified',
'Rejected'
)
THEN 1
ELSE 0
END
),0) AS AllProcessedApplications

FROM GuestHouseRoomBookings

WHERE 

IsActive = 1

AND BookingStatus IN
(
'Submitted',
'Verified',
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

exports.getPendingApplications = async (req, res) => {

    try {

        const pool = await poolPromise;

        const result = await pool.request()

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

WHERE 

    b.BookingStatus = 'Submitted'

ORDER BY

    b.BookingDateTime DESC

`);

        res.status(200).json({

            success: true,

            count: result.recordset.length,

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


exports.getApplications = async (req, res) => {

    try {

        const pool = await poolPromise;

        const result = await pool.request()

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

WHERE 

    b.IsActive = 1
WHERE b.AssignedVerifierID IN (

SELECT RoleMapId

FROM Proof..OrgUnitUserMapping

WHERE UserId=@UserID

AND IsActive=1

)

AND b.BookingStatus IN
(
    'Submitted',
    'Verified',
    'Rejected'
)

ORDER BY

    b.BookingDateTime DESC

`);

        res.status(200).json({

            success: true,

            count: result.recordset.length,

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



exports.getApplication = async (req,res)=>{

    try {

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

    gt.GuestTypeName,

    gh.GuestHouseName,

    vr.RoleName AS VerifierRole,

    ar.RoleName AS ApproverRole,

    gr.RoleName AS AllocatorRole

FROM GuestHouseRoomBookings b

LEFT JOIN GuestTypeMaster gt
ON gt.GuestTypeID=b.GuestTypeID

LEFT JOIN GuestHouseMaster gh
ON gh.GuestHouseID = b.GuestHouseID



LEFT JOIN Proof..OrgUnitRoleMapping ov
ON ov.RoleMapID = b.AssignedVerifierID

LEFT JOIN Proof..RoleMaster vr
ON vr.RoleID = ov.RoleID



LEFT JOIN Proof..OrgUnitRoleMapping oa
ON oa.RoleMapID = b.AssignedApproverID

LEFT JOIN Proof..RoleMaster ar
ON ar.RoleID = oa.RoleID


/* Guest House Incharge */

LEFT JOIN Proof..OrgUnitRoleMapping og
ON og.RoleMapID = b.AssignedAllocatorID

LEFT JOIN Proof..RoleMaster gr
ON gr.RoleID = og.RoleID
ON gh.GuestHouseID=b.GuestHouseID

WHERE

b.GHBookingID=@BookingID

AND b.IsActive=1

`);


        if(bookingResult.recordset.length===0){

            return res.status(404).json({

                success:false,
                message:"Application not found."

            });

        }


        const application = bookingResult.recordset[0];


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

ON rt.RoomTypeID=d.RoomTypeID


WHERE

d.GHBookingID=@BookingID

`);



        application.RoomRequirements =
            roomResult.recordset;



        application.WorkflowHistory =
            await getWorkflowHistory(
                "GuestHouseBooking",
                bookingId
            );

        application.AssignedVerifier = {
            RoleName: application.VerifierRole
        };

        application.AssignedApprover = {
            RoleName: application.ApproverRole
        };

        application.AssignedAllocator = {
            RoleName: application.AllocatorRole
        };
        

        application.RoomRequirements =
            roomResult.recordset;


        return res.status(200).json({

            success:true,

            data:application

        });


    }

    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,
            message:err.message

        });

    }

};



exports.verifyApplication = async(req,res)=>{


const transaction =
new sql.Transaction(await poolPromise);



try{


await transaction.begin();


const bookingId=req.params.bookingId;


const remarks=req.body.remarks || "";



const booking =
await getBookingDetails(bookingId);



if(!booking){


await transaction.rollback();


return res.status(404).json({

success:false,

message:"Booking not found."

});


}



await changeWorkflowStatus(

transaction,

{

bookingId,

previousStatus:booking.BookingStatus,

currentStatus:"Verified",

actionName:"Verify",

authorityRole:"Verifier",

authorityName:"SYSTEM",

actionBy:"SYSTEM",

remarks

}


);



await transaction.commit();



return res.status(200).json({

success:true,

message:"Application verified successfully."

});



}

catch(err){


await transaction.rollback();


console.error(err);


res.status(500).json({

success:false,

message:err.message

});


}


};




exports.viewDocument = async (req, res) => {

    try {

        const currentUser = req.user;

        // Authentication
        AuthorizationService.ensureAuthenticated(currentUser);

        const pool = await poolPromise;

        const bookingId = req.params.bookingId;

        // Fetch Booking
        const bookingResult = await pool.request()

            .input(
                "BookingID",
                sql.VarChar,
                bookingId
            )

            .query(`

SELECT

    BookedBy,

    AssignedVerifierID,

    AssignedApproverID,

    AssignedAllocatorID,

    SupportingDoc

FROM GuestHouseRoomBookings

WHERE

    GHBookingID = @BookingID

    AND IsActive = 1

`);

        if (bookingResult.recordset.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Booking not found."

            });

        }

        const booking = bookingResult.recordset[0];

        // Authorization
        AuthorizationService.ensureDocumentAccess(

            booking,

            currentUser

        );

        if (!booking.SupportingDoc) {

            return res.status(404).json({

                success: false,

                message: "Supporting document not found."

            });

        }

        const buffer = booking.SupportingDoc;

        // Detect File Type
        if (

            buffer.length >= 4 &&

            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47

        ) {

            res.setHeader("Content-Type", "image/png");

        }

        else if (

            buffer.length >= 2 &&

            buffer[0] === 0xFF &&
            buffer[1] === 0xD8

        ) {

            res.setHeader("Content-Type", "image/jpeg");

        }

        else if (

            buffer.length >= 4 &&

            buffer[0] === 0x25 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x44 &&
            buffer[3] === 0x46

        ) {

            res.setHeader("Content-Type", "application/pdf");

        }

        else {

            res.setHeader("Content-Type", "application/octet-stream");

        }

        return res.send(buffer);

    }

    catch (err) {

        console.error(err);

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

        const currentUser = req.user;

        const bookingId = req.params.bookingId;

        const remarks = req.body.remarks || "";

        // Authentication & Authorization
        AuthorizationService.ensureAuthenticated(currentUser);

        await AuthorizationService.ensureVerifier(currentUser);

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
            booking.AssignedVerifierID,
            currentUser,
            "Approver"
        );

        // Status Validation
        AuthorizationService.ensureBookingStatus(

            booking,

            "Submitted"

        );

        // Update Workflow
        await changeWorkflowStatus(

            transaction,

            {

                bookingId,

                previousStatus: booking.BookingStatus,

                currentStatus: "Rejected",

                actionName: "Reject",

                authorityRole: "Verifier",

                authorityName: currentUser.EmployeeName,

                actionBy: currentUser.EmployeeId,

                remarks

            }

        );

        await transaction.commit();

        // Notify Applicant
        // try {

        //     if (booking.EmployeeEmail) {

        //         await NotificationService.sendBookingRejected(

        //             booking.EmployeeEmail,

        //             {

        //                 EmployeeName:
        //                     booking.EmployeeName,

        //                 BookingNo:
        //                     booking.GHRBookingNo,

        //                 GuestName:
        //                     booking.GuestName,

        //                 GuestType:
        //                     booking.GuestTypeName,

        //                 Purpose:
        //                     booking.PurposeOfVisit,

        //                 ArrivalDate:
        //                     formatDate(
        //                         booking.ArrivalDateTime
        //                     ),

        //                 DepartureDate:
        //                     formatDate(
        //                         booking.DepartureDateTime
        //                     ),

        //                 Remarks:
        //                     remarks

        //             }

        //         );

        //     }

        // }

        // catch (mailError) {

        //     console.error("Email Error:", mailError);

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