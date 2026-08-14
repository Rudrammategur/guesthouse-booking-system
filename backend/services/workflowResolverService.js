const sql = require("mssql");

const { poolPromise } = require("../config/db");

const {

    isProjectFund

} = require("../utils/expenditureHelper");

/*
---------------------------------------------------
Resolve Workflow
---------------------------------------------------
*/

exports.resolveWorkflow = async (

    applicantRoleMapId,

    expenditureHead,

    moduleName

) => {

    const pool = await poolPromise;

    const projectFund = isProjectFund(expenditureHead);

    const workflowResult =
        await pool.request()

            .input(
                "ApplicantRoleMapID",
                sql.BigInt,
                applicantRoleMapId
            )

            .input(
                "IsProjectFund",
                sql.Bit,
                projectFund
            )

            .input(
                "ModuleName",
                sql.VarChar(50),
                moduleName
            )

            .query(`

SELECT *

FROM WorkflowAssignmentMaster

WHERE

ApplicantRoleMapID = @ApplicantRoleMapID

AND IsProjectFund = @IsProjectFund

AND ModuleName = @ModuleName

AND IsActive = 1

`);

    if (workflowResult.recordset.length === 0) {

        throw new Error(
            "Workflow configuration not found."
        );

    }

    console.log("Workflow Result:", workflowResult.recordset);

    const workflow =
        workflowResult.recordset[0];

    console.log("Workflow:", workflow);

    return {

        verifierRoleMapID:
            workflow.VerifierRoleMapID,

        alternateVerifierRoleMapID:
            workflow.AlternateVerifierRoleMapID,

        approverRoleMapID:
            workflow.ApproverRoleMapID,

        alternateApproverRoleMapID:
            workflow.AlternateApproverRoleMapID,

        allocatorRoleMapID:
            workflow.AllocatorRoleMapID,

        alternateAllocatorRoleMapID:
            workflow.AlternateAllocatorRoleMapID

    };

};