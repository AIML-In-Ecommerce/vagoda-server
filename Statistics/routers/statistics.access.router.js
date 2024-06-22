import express from 'express'
import StatisticsAccessController from '../controllers/statistics.access.controller.js'
import VerificationService from '../services/verification.service.js'


const router = express.Router()

router.get("/welcome", (req, res, next) => {return res.json({
    message: "welcome to access path of Statistics Service",
    data: {}
})})

router.post("/session/product", VerificationService.verifySessionId, StatisticsAccessController.setAccessProductBySessionId)

router.get("/buyer/product", StatisticsAccessController.getAccessProductsByBuyer)

router.post("/buyer/product", StatisticsAccessController.setAccessProductByBuyer)

export default router