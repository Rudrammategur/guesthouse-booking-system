function getCurrentUser(req) {

    let user = null;


    // For POST FormData APIs
    if (req.body && req.body.currentUser) {

        user =
            typeof req.body.currentUser === "string"
                ?
                JSON.parse(req.body.currentUser)
                :
                req.body.currentUser;

    }


    // For GET APIs
    if (!user && req.headers["x-user-data"]) {

        user =
            JSON.parse(
                req.headers["x-user-data"]
            );

    }
    // Normalize API response structure
    if (user?.data) {

        user = user.data;

    }


    return user;

}


module.exports = getCurrentUser;