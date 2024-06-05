import express from 'express'
import StatisticsAccessController from '../controllers/statistics.access.controller.js'


const router = express.Router()

router.get("/welcome", (req, res, next) => res.json({message: "welcome"}))

router.get("/user/product",
    StatisticsAccessController.getAccessProductsByBuyer
)

router.post("/user/product", 
    StatisticsAccessController.setAccessProductByBuyer
)


export default router