import express from "express"
import bankstatementRouter from "./bankstatement.router.js"

const rootRouter = express.Router()



rootRouter.use("/settlement", bankstatementRouter)

export default rootRouter