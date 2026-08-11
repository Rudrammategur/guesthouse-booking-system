const express = require("express");

const router = express.Router();

const guestHouseBookingController = require("../controllers/guestHouseBookingController");

const upload = require("../middleware/uploadMiddleware");

router.post(
    "/",
    (req, res, next) => {
        console.log("POST /api/guesthouse HIT");
        next();
    },
    upload.single("SupportingDoc"),
    guestHouseBookingController.createBooking
);

router.get("/dashboard-counts", guestHouseBookingController.getDashboardCounts);

router.get("/my-applications", guestHouseBookingController.getMyApplications);

router.get("/application/:bookingId", guestHouseBookingController.getApplicationDetails);

router.get(
    "/application/:bookingId/document",
    guestHouseBookingController.getSupportingDocument
);

router.put("/:bookingId/cancel", guestHouseBookingController.cancelBooking);

module.exports = router;