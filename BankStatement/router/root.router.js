import express from "express";
import bankstatementRouter from "./bankstatement.router.js";
import transactionRouter from "./transaction.router.js";

const rootRouter = express.Router();

rootRouter.get("/settlement/welcome", (req, res, next) => {
    return res.json({
        message: "welcome to path settlement"
    })
}) rootRouter.use("/settlement", bankstatementRouter);
rootRouter.use("/transaction", transactionRouter);

export default rootRouter;

