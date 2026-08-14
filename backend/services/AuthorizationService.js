
const RoleService = require("./RoleService");


/*
=========================================================
Ensure User Logged In
=========================================================
*/

exports.ensureAuthenticated = (currentUser) => {

    if (
        !currentUser ||
        !currentUser.IsAuthenticated
    ) {

        throw new Error(
            "User not authenticated."
        );

    }

};


/*
=========================================================
Get Fresh User RoleMapIDs
=========================================================
IMPORTANT:
Do not rely blindly on currentUser.RoleMapIDs because
that object may contain incomplete/stale role information.

Always resolve active roles from the database.
=========================================================
*/

exports.getUserRoleMapIds = async (currentUser) => {

    if (!currentUser?.UserId) {

        throw new Error(
            "User information is missing."
        );

    }

    const roleMapIds =
        await RoleService.getUserRoleMapIds(
            currentUser.UserId
        );

    return Array.isArray(roleMapIds)
        ? roleMapIds.map(Number)
        : [];

};


/*
=========================================================
Get User RoleMapIDs For A Specific Role
=========================================================
*/

exports.getUserRoleMapIdsByRole = async (
    currentUser,
    roleName
) => {

    if (!currentUser?.UserId) {

        throw new Error(
            "User information is missing."
        );

    }

    const userRoles =
        await RoleService.getUserRoles(
            currentUser.UserId
        );

    return userRoles

        .filter(role =>
            role.IsActive === undefined ||
            role.IsActive === 1 ||
            role.IsActive === true
        )

        .filter(role =>
            String(role.RoleName).toLowerCase() ===
            String(roleName).toLowerCase()
        )

        .map(role =>
            Number(role.RoleMapId)
        );

};


/*
=========================================================
Generic Role Validation
=========================================================
*/

exports.ensureRole = async (
    currentUser,
    roleName
) => {

    const requiredRoleMapIds =
        await RoleService.getRoleMapIdsByRoleName(
            roleName
        );

    console.log(
        "Required RoleMapIDs:",
        requiredRoleMapIds
    );


    /*
     * Always get fresh user roles from DB.
     */
    const userRoleMapIds =
        await exports.getUserRoleMapIds(
            currentUser
        );

    console.log(
        "Fresh User RoleMapIDs:",
        userRoleMapIds
    );


    const hasRole =
        userRoleMapIds.some(
            roleMapId =>
                requiredRoleMapIds.includes(
                    Number(roleMapId)
                )
        );


    if (!hasRole) {

        throw new Error(
            `You are not authorized as ${roleName}.`
        );

    }

};


/*
=========================================================
Applicant
=========================================================
*/

exports.ensureApplicant = async (
    currentUser
) => {

    await exports.ensureRole(
        currentUser,
        "IITDH EMPLOYEES"
    );

};


/*
=========================================================
Verifier
=========================================================
*/

exports.ensureVerifier = async (
    currentUser
) => {

    await exports.ensureRole(
        currentUser,
        "C&SOffice"
    );

};


/*
=========================================================
Approver
=========================================================
*/

exports.ensureApprover = async (
    currentUser
) => {

    const userRoleMapIds =
        await exports.getUserRoleMapIds(
            currentUser
        );


    const deanAdminRoles =
        await RoleService.getRoleMapIdsByRoleName(
            "ADMIN DEAN"
        );


    const deanRnDRoles =
        await RoleService.getRoleMapIdsByRoleName(
            "R&D Dean"
        );


    const validRoles = [

        ...deanAdminRoles,

        ...deanRnDRoles

    ];


    const hasRole =
        userRoleMapIds.some(
            roleMapId =>
                validRoles.includes(
                    Number(roleMapId)
                )
        );


    if (!hasRole) {

        throw new Error(
            "You are not authorized as Approver."
        );

    }

};


/*
=========================================================
Guest House Allocator
=========================================================
*/

exports.ensureAllocator = async (
    currentUser
) => {

    await exports.ensureRole(
        currentUser,
        "TransitOffice"
    );

};


/*
=========================================================
Transport Office
=========================================================
*/

exports.ensureTransportOffice = async (
    currentUser
) => {

    await exports.ensureRole(
        currentUser,
        "TransportOffice"
    );

};


/*
=========================================================
Booking Status Validation
=========================================================
*/

exports.ensureBookingStatus = (
    booking,
    expectedStatus
) => {

    if (
        booking.BookingStatus !==
        expectedStatus
    ) {

        throw new Error(
            `Only ${expectedStatus} applications are allowed.`
        );

    }

};


/*
=========================================================
Assigned Role Validation
=========================================================
IMPORTANT:
Always resolve the user's current RoleMapIDs from DB.
This prevents an incomplete currentUser.RoleMapIDs
array from denying valid access.
=========================================================
*/

exports.ensureAssignedRole = async (
    assignedRoleMapId,
    currentUser,
    role = "authority"
) => {

    if (!currentUser) {

        throw new Error(
            "User information is missing."
        );

    }


    const userRoleMapIds =
        await exports.getUserRoleMapIds(
            currentUser
        );


    console.log(
        "Assigned RoleMapID:",
        Number(assignedRoleMapId)
    );

    console.log(
        "Fresh User RoleMapIDs:",
        userRoleMapIds
    );


    const hasAccess =
        userRoleMapIds.includes(
            Number(assignedRoleMapId)
        );


    if (!hasAccess) {

        throw new Error(
            `This application is not assigned to your ${role} role.`
        );

    }

};


/*
=========================================================
Assigned Role Validation By Specific Role
=========================================================
This is even safer for Transport Office because the
user may have many unrelated RoleMapIDs.
=========================================================
*/

exports.ensureAssignedRoleByName = async (
    assignedRoleMapId,
    currentUser,
    roleName
) => {

    if (!currentUser) {

        throw new Error(
            "User information is missing."
        );

    }


    const roleMapIds =
        await exports.getUserRoleMapIdsByRole(
            currentUser,
            roleName
        );


    console.log(
        `${roleName} RoleMapIDs:`,
        roleMapIds
    );


    const hasAccess =
        roleMapIds.includes(
            Number(assignedRoleMapId)
        );


    if (!hasAccess) {

        throw new Error(
            `This application is not assigned to your ${roleName} role.`
        );

    }

};


/*
=========================================================
Applicant Owner
=========================================================
*/

exports.ensureApplicantOwner = (
    booking,
    currentUser
) => {

    if (
        booking.BookedBy !==
        currentUser.EmployeeId
    ) {

        throw new Error(
            "Only the applicant can perform this action."
        );

    }

};


/*
=========================================================
Cancellation Validation
=========================================================
*/

exports.ensureCancellable = (
    booking
) => {

    const restrictedStatuses = [

        "Checked In",

        "Checked Out",

        "Cancelled",

        "Rejected"

    ];


    if (
        restrictedStatuses.includes(
            booking.BookingStatus
        )
    ) {

        throw new Error(
            `Booking cannot be cancelled because it is already ${booking.BookingStatus}.`
        );

    }

};


/*
=========================================================
Document Access
=========================================================
Supports:
- Applicant
- Verifier
- Approver
- Guest House Allocator
- Transport Office
=========================================================
*/

exports.ensureDocumentAccess = async (
    booking,
    currentUser
) => {

    if (!currentUser) {

        throw new Error(
            "User information is missing."
        );

    }


    const userRoleMapIds =
        await exports.getUserRoleMapIds(
            currentUser
        );


    const hasApplicantAccess =
        booking.BookedBy ===
        currentUser.EmployeeId;


    const hasVerifierAccess =
        userRoleMapIds.includes(
            Number(
                booking.AssignedVerifierID
            )
        );


    const hasApproverAccess =
        userRoleMapIds.includes(
            Number(
                booking.AssignedApproverID
            )
        );


    const hasGuestHouseAllocatorAccess =
        booking.AssignedAllocatorID != null &&
        userRoleMapIds.includes(
            Number(
                booking.AssignedAllocatorID
            )
        );


    const hasTransportOfficeAccess =
        booking.AssignedTransportOfficeID != null &&
        userRoleMapIds.includes(
            Number(
                booking.AssignedTransportOfficeID
            )
        );


    const hasAccess =
        hasApplicantAccess ||
        hasVerifierAccess ||
        hasApproverAccess ||
        hasGuestHouseAllocatorAccess ||
        hasTransportOfficeAccess;


    if (!hasAccess) {

        throw new Error(
            "You are not authorized to view this document."
        );

    }

};
