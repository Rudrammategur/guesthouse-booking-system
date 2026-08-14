const express = require("express");

const router = express.Router();

const transportController = require("../controllers/transportController");

const upload = require("../middleware/uploadMiddleware");


router.post(
    "/",
    upload.single("SupportingDoc"),
    transportController.createBooking
);

router.get(
    "/dashboard-counts",
    transportController.getDashboardCounts
);

router.get(
    "/my-applications",
    transportController.getMyApplications
);

router.get(
    "/application/:bookingId",
    transportController.getApplicationDetails
);

router.put(
    "/:bookingId/cancel",
    transportController.cancelBooking
);

router.get(
    "/application/:bookingId/document",
    transportController.getSupportingDocument
);

router.get(
    "/application/:bookingId/print",
    transportController.getPrintApplication
);


module.exports = router;


// const express = require("express");

// const router = express.Router();

// const transportController =
//     require("../controllers/transportController");

// const upload =
//     require("../middleware/uploadMiddleware");

// router.post(
//     "/",
//     upload.single("SupportingDoc"),
//     (req, res) => {

//         console.log("TRANSPORT POST ROUTE HIT");

//         console.log("BODY:", req.body);
//         console.log("FILE:", req.file);

//         res.json({
//             success: true,
//             message: "Transport POST route is working"
//         });
//     }
// );

// module.exports = router;