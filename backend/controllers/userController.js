const { sql, poolPromise } = require("../config/db");

exports.getCurrentUser = async (req, res) => {
    try {
        console.log("========== getCurrentUser ==========");
        console.log("Query Params:", req.query);

        const { name } = req.query;

        if (!name) {
            console.log("Name not received.");
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        console.log("Searching for:", name);

        console.log("poolPromise:", poolPromise);

        const pool = await poolPromise;

        console.log("Pool obtained:", pool);
        console.log("pool.request:", pool?.request);

      const query = `
    SELECT TOP 1
        EmployeeId,
        UserName,
        DisplayName,
        PrimaryMail,
        PersonalMail,
        MobileNumber
    FROM HR..EmployeeBasicInfo
    WHERE UPPER(DisplayName) LIKE '%' + UPPER(@name) + '%'
`;

        console.log("Executing Query:");
        console.log(query);

        const result = await pool
            .request()
            .input("name", sql.VarChar, name)
            .query(query);

        console.log("Query Result:", result.recordset);

        if (result.recordset.length === 0) {
            console.log("Employee not found.");

            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        console.log("Employee Found:", result.recordset[0]);

        return res.status(200).json({
            success: true,
            data: result.recordset[0]
        });

    } catch (error) {

        console.error("========== ERROR ==========");
        console.error(error);
        console.error(error.stack);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};