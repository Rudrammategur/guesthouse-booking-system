const express = require("express");

const router = express.Router();

const transportVerifierController =
    require("../controllers/transportVerifierController");


router.get(
    "/dashboard-counts",
    transportVerifierController.getDashboardCounts
);


router.get(
    "/applications",
    transportVerifierController.getApplications
);


router.get(
    "/application/:bookingId",
    transportVerifierController.getApplication
);

router.put(
    "/verify/:bookingId",
    transportVerifierController.verifyApplication
);

router.put(
    "/reject/:bookingId",
    transportVerifierController.rejectApplication
);

module.exports = router;