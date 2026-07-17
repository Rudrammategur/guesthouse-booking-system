const sql = require("mssql");
const { poolPromise } = require("../config/db");

/**
 * Returns RoleMapId for a Role Name
 * Example:
 * C&S Office
 * Dean Admin
 * Dean R&D
 * Transit Office
 */
exports.getRoleMapIdsByRoleName = async (roleName) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input("RoleName", sql.NVarChar, roleName)

        .query(`

SELECT orm.RoleMapId

FROM Proof..OrgUnitRoleMapping orm

INNER JOIN Proof..RoleMaster rm
ON rm.RoleId = orm.RoleId

WHERE

rm.RoleName = @RoleName

AND orm.IsActive = 1

`);

    return result.recordset.map(x => Number(x.RoleMapId));

};


/**
 * Returns all active RoleMapIds assigned to a User
 */
exports.getUserRoleMapIds = async (userId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "UserId",
            sql.BigInt,
            Number(userId)
        )

        .query(`

SELECT

RoleMapId

FROM Proof..OrgUnitUserMapping

WHERE

UserId=@UserId

AND IsActive=1

`);

    return result.recordset.map(r => Number(r.RoleMapId));

};