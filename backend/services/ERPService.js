const sql = require("mssql");
const { poolPromise } = require("../config/db");

/*
--------------------------------------------------
Get User mapped to RoleMapID
--------------------------------------------------
*/

exports.getUserByRoleMapId = async (roleMapId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "RoleMapID",
            sql.BigInt,
            roleMapId
        )

        .query(`

SELECT TOP 1

    oum.UserId,

    um.UserName,

    um.FirstName,

    um.MiddleName,

    um.LastName,

    um.Email,

    oum.RoleMapID

FROM Proof.dbo.OrgUnitUserMapping oum

INNER JOIN Proof.dbo.UserMaster um

ON um.UserId = oum.UserId

WHERE

    oum.RoleMapID = @RoleMapID

AND

    oum.IsActive = 1

ORDER BY

    oum.IsDefault DESC,
    oum.Sequence

`);

    return result.recordset[0];

};


/*
--------------------------------------------------
Get RoleMap Details
--------------------------------------------------
*/

exports.getRoleMap = async (roleMapId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "RoleMapID",
            sql.BigInt,
            roleMapId
        )

        .query(`

SELECT *

FROM Proof.dbo.OrgUnitRoleMapping

WHERE

RoleMapID=@RoleMapID

`);

    return result.recordset[0];

};


/*
--------------------------------------------------
Get User By UserID
--------------------------------------------------
*/

exports.getUser = async (userId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input(
            "UserID",
            sql.BigInt,
            userId
        )

        .query(`

SELECT *

FROM Proof.dbo.UserMaster

WHERE UserID=@UserID

`);

    return result.recordset[0];

};

/**
 * --------------------------------------------------------
 * Get Role Mappings of User
 * --------------------------------------------------------
 */

exports.getRoleMappings = async (userId) => {

    const pool = await poolPromise;

    const result = await pool.request()

        .input("UserId", sql.BigInt, userId)

        .query(`

SELECT

    RoleMapID

FROM Proof.dbo.OrgUnitUserMapping

WHERE

UserId=@UserId

AND IsActive=1

ORDER BY IsDefault DESC, Sequence

`);

    return result.recordset;

};