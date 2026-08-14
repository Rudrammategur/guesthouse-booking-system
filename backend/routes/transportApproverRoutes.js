const express = require("express");

const router = express.Router();

const transportApproverController =
    require("../controllers/transportApproverController");


/*
 * Dashboard
 */

router.get(
    "/dashboard-counts",
    transportApproverController.getDashboardCounts
);

router.get(
    "/applications",
    transportApproverController.getApplications
);


/*
 * Application
 */

router.get(
    "/application/:bookingId",
    transportApproverController.getApplication
);


/*
 * Approve / Reject
 */

router.put(
    "/approve/:bookingId",
    transportApproverController.approveApplication
);

router.put(
    "/reject/:bookingId",
    transportApproverController.rejectApplication
);


module.exports = router;