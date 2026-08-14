const express = require("express");

const router = express.Router();

const transportAllocatorController =
    require("../controllers/transportAllocatorController");


/*
=========================================================
DASHBOARD
=========================================================
*/

router.get(
    "/dashboard-counts",
    transportAllocatorController.getDashboardCounts
);

router.get(
    "/applications",
    transportAllocatorController.getApplications
);


/*
=========================================================
APPLICATION DETAILS
=========================================================
*/

router.get(
    "/application/:bookingId",
    transportAllocatorController.getApplication
);


/*
=========================================================
VEHICLE ALLOCATION
=========================================================
*/

router.put(
    "/allocate/:bookingId",
    transportAllocatorController.allocateVehicle
);


module.exports = router;