import express from "express"
import bankstatementRouter from "./bankstatement.router.js"

const rootRouter = express.Router()

rootRouter.get("/settlement/welcome", (req, res, next) => {
    return res.json({
        message: "welcome to path settlement"
    })
}) 

rootRouter.use("/settlement", bankstatementRouter)


export default rootRouter