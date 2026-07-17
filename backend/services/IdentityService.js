const ERPService = require("./ERPService");

exports.getCurrentUser = async (req) => {

    if (!req.user) {

        throw new Error("User is not authenticated.");

    }

    const roleMappings =
        await ERPService.getRoleMappings(
            req.user.UserId
        );

    return {

        ...req.user,

        RoleMapIDs:
            roleMappings.map(
                x => x.RoleMapID
            )

    };

};