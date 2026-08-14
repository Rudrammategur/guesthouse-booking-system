const express = require("express");
require("dotenv").config();
const { sql, poolPromise } = require("./config/db");
const db = require("./config/db");
const app = express();
const cors = require("cors");
const expenditureHeadRoutes = require("./routes/expenditureHeadRoutes");
const guestHouseBookingRoutes = require("./routes/guestHouseBookingRoutes");
const verifierRoutes = require("./routes/verifierRoutes");
const approverRoutes = require("./routes/approverRoutes");
const userRoutes = require("./routes/userRoutes");
const masterRoutes = require("./routes/masterRoutes");
const guestHouseInchargeRoutes = require("./routes/guestHouseInchargeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const transportRoutes = require("./routes/transportRoutes");
const transportVerifierRoutes = require("./routes/transportVerifierRoutes");
const transportApproverRoutes = require("./routes/transportApproverRoutes");
const transportAllocatorRoutes = require("./routes/transportAllocatorRoutes");

app.use(express.json());
app.use(cors());
app.use("/api/expenditure-heads",expenditureHeadRoutes);
app.use("/api/guesthouse",guestHouseBookingRoutes);
app.use("/api/verifier", verifierRoutes);
app.use("/api/approver",approverRoutes);
app.use("/api/user",userRoutes);
app.use("/api/master",masterRoutes);
app.use("/api/gh-incharge", guestHouseInchargeRoutes);
// app.use("/api/bookings",bookingRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/workflow",workflowRoutes);
app.use("/api/test/workflow", require("./routes/testWorkflowRoutes"));
app.use("/api/transport", transportRoutes);
app.use("/api/transport-verifier", transportVerifierRoutes);
app.use("/api/transport-approver", transportApproverRoutes);
app.use("/api/transport-allocator",transportAllocatorRoutes);




const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:");
    console.error(err);

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File exceeds 200 KB."
        });
    }

    res.status(500).json({
        success: false,
        message: err.message
    });
});

app.get("/api/transport/test", (req, res) => {
    res.json({
        success: true,
        message: "Transport route is working"
    });
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
