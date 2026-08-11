const RoleService = require("./RoleService");

/**
 * Ensure User Logged In
 */
exports.ensureAuthenticated = (currentUser) => {

    if (!currentUser || !currentUser.IsAuthenticated) {

        throw new Error("User not authenticated.");

    }

};


/**
 * Generic Role Validation
 */
exports.ensureRole = async (currentUser, roleName) => {

    const requiredRoleMapIds =
        await RoleService.getRoleMapIdsByRoleName(roleName);

    console.log("Required RoleMapIDs:", requiredRoleMapIds);

    const userRoleMapIds =
        currentUser.RoleMapIDs ||
        await RoleService.getUserRoleMapIds(currentUser.UserId);

    console.log("User RoleMapIDs:", userRoleMapIds);

    const hasRole =
        userRoleMapIds.some(roleMapId =>
            requiredRoleMapIds.includes(Number(roleMapId))
        );

    if (!hasRole) {
        throw new Error(`You are not authorized as ${roleName}.`);
    }
};


/**
 * Applicant
 */
exports.ensureApplicant = async (currentUser) => {

    const requiredRoleMapIds =
        await RoleService.getRoleMapIdsByRoleName(
            "IITDH EMPLOYEES"
        );

    console.log("Required RoleMapIDs:", requiredRoleMapIds);
    console.log("Current User RoleMapIDs:", currentUser.RoleMapIDs);

    await exports.ensureRole(
        currentUser,
        "IITDH EMPLOYEES"
    );
};


/**
 * Verifier
 */
exports.ensureVerifier = async (currentUser) => {

    await exports.ensureRole(

        currentUser,

        "C&SOffice"

    );

};


/**
 * Approver
 */
exports.ensureApprover = async (currentUser) => {

    const userRoleMapIds =
        currentUser.RoleMapIDs ||
        await RoleService.getUserRoleMapIds(
            currentUser.UserId
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
        userRoleMapIds.some(roleMapId =>
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

/**
 * Transit Office
 */
exports.ensureAllocator = async (currentUser) => {

    await exports.ensureRole(

        currentUser,

        "TransitOffice"

    );

};


/**
 * Booking Status Validation
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

exports.ensureAssignedRole = async (

    assignedRoleMapId,

    currentUser,

    role = "authority"

) => {

    const userRoleMapIds =
        currentUser.RoleMapIDs ||
        await RoleService.getUserRoleMapIds(
            currentUser.UserId
        );

    const hasAccess =
        userRoleMapIds.some(roleMapId =>
            Number(roleMapId) ===
            Number(assignedRoleMapId)
        );

    if (!hasAccess) {

        throw new Error(

            `This application is not assigned to your ${role} role.`

        );

    }

};

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

exports.ensureCancellable = (booking) => {

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


exports.ensureDocumentAccess = async (

    booking,

    currentUser

) => {

    const userRoleMapIds =
        currentUser.RoleMapIDs ||
        await RoleService.getUserRoleMapIds(
            currentUser.UserId
        );

    const hasAccess =

        booking.BookedBy ===
        currentUser.EmployeeId ||

        userRoleMapIds.includes(
            Number(booking.AssignedVerifierID)
        ) ||

        userRoleMapIds.includes(
            Number(booking.AssignedApproverID)
        ) ||

        userRoleMapIds.includes(
            Number(booking.AssignedAllocatorID)
        );

    if (!hasAccess) {

        throw new Error(

            "You are not authorized to view this document."

        );

    }

};



