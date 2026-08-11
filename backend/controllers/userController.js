// const { sql, poolPromise } = require("../config/db");

// exports.getCurrentUser = async (req, res) => {
//     try {
//         console.log("========== getCurrentUser ==========");
//         console.log("Query Params:", req.query);

//         const { name } = req.query;

//         if (!name) {
//             console.log("Name not received.");
//             return res.status(400).json({
//                 success: false,
//                 message: "Name is required."
//             });
//         }

//         console.log("Searching for:", name);

//         console.log("poolPromise:", poolPromise);

//         const pool = await poolPromise;

//         console.log("Pool obtained:", pool);
//         console.log("pool.request:", pool?.request);

//       const query = `
//     SELECT TOP 1
//         EmployeeId,
//         UserName,
//         DisplayName,
//         PrimaryMail,
//         PersonalMail,
//         MobileNumber
//     FROM HR..EmployeeBasicInfo
//     WHERE UPPER(DisplayName) LIKE '%' + UPPER(@name) + '%'
// `;

//         console.log("Executing Query:");
//         console.log(query);

//         const result = await pool
//             .request()
//             .input("name", sql.VarChar, name)
//             .query(query);

//         console.log("Query Result:", result.recordset);

//         if (result.recordset.length === 0) {
//             console.log("Employee not found.");

//             return res.status(404).json({
//                 success: false,
//                 message: "Employee not found."
//             });
//         }

//         console.log("Employee Found:", result.recordset[0]);

//         return res.status(200).json({
//             success: true,
//             data: result.recordset[0]
//         });

//     } catch (error) {

//         console.error("========== ERROR ==========");
//         console.error(error);
//         console.error(error.stack);

//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//             error: error.message
//         });

//     }
// };







const { sql, poolPromise } = require("../config/db");

exports.getCurrentUser = async (req, res) => {
    try {

        console.log("========== getCurrentUser ==========");
        console.log("Query Params:", req.query);

        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        const pool = await poolPromise;

        // ----------------------------
        // Get Employee Details
        // ----------------------------
        const employeeQuery = `
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

        const employeeResult = await pool
            .request()
            .input("name", sql.VarChar, name)
            .query(employeeQuery);

        if (employeeResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        const employee = employeeResult.recordset[0];

        console.log("Employee Found:", employee);

        // ----------------------------
        // Get User RoleMapIDs
        // ----------------------------
        const roleResult = await pool
            .request()
            .input("UserName", sql.VarChar, employee.UserName)
            .query(`
                SELECT
                    E.UserId,
    C.RoleName,
    A.RoleMapId
                FROM Proof..OrgUnitUserMapping A WITH(NOLOCK)
                INNER JOIN Proof..OrgUnitRoleMapping B WITH(NOLOCK)
                    ON A.RoleMapId = B.RoleMapId
                INNER JOIN Proof..RoleMaster C WITH(NOLOCK)
                    ON B.RoleId = C.RoleId
                INNER JOIN Proof..UserMaster E WITH(NOLOCK)
                    ON E.UserId = A.UserId
                WHERE
                    E.UserName = @UserName
                    AND A.IsActive = 1
            `);

        console.log("Role Mapping:", roleResult.recordset);

        const currentUser = {
            UserId: Number(roleResult.recordset[0].UserId),
            UserName: employee.UserName,
            EmployeeId: employee.EmployeeId,
            EmployeeName: employee.DisplayName,
            EmployeeEmail: employee.PrimaryMail,
            MobileNumber: employee.MobileNumber,
            RoleMapIDs: roleResult.recordset.map(r => Number(r.RoleMapId)),
            Roles: roleResult.recordset,
            IsAuthenticated: true
        };

        console.log("Employee:", employee);
        console.log("Role Result:", roleResult.recordset);
        console.log("Current User:", currentUser);

        return res.status(200).json({
            success: true,
            data: currentUser
        });

    } catch (error) {

        console.error("========== ERROR ==========");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};