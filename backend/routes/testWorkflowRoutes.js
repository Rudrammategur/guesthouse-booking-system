const express = require("express");

const router = express.Router();

const WorkflowEngine = require("../services/workflowResolverService");

router.get("/start/:processId", async (req, res) => {

    try {

        const process =
            await WorkflowEngine.startProcess(

                Number(req.params.processId)

            );

        res.json(process);

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

module.exports = router;