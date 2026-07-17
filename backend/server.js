const express = require("express");
require("dotenv").config();
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
const { mockLogin } = require("./middleware/authMiddleware");


app.use(express.json());
app.use(cors());
app.use(mockLogin);
app.use("/api/expenditure-heads",expenditureHeadRoutes);
app.use("/api/guesthouse",guestHouseBookingRoutes);
app.use("/api/verifier", verifierRoutes);
app.use("/api/approver",approverRoutes);
app.use("/api/user",userRoutes);
app.use("/api/master",masterRoutes);
app.use("/api/gh-incharge", guestHouseInchargeRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/workflow",workflowRoutes);
app.use("/api/test/workflow", require("./routes/testWorkflowRoutes"));


const { sql, poolPromise } = require("./config/db");

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
