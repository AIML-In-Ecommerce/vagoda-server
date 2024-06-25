import express from 'express'
import ShopStatisticsController from '../controllers/statistics.shop.controller.js'
import VerificationService from '../services/verification.service.js'

const router = express.Router()

router.get("/welcome", (req, res, next) => {return res.json({
    message: "welcome to shop path of Statistics Service",
    data: {}
})})

router.post("/sales/total",  ShopStatisticsController.getTotalSales)
router.post("/revenue/total",  ShopStatisticsController.getTotalRevenue)
router.post("/conversion/view_and_sales",  ShopStatisticsController.getConversionOfViewAndSales)
router.post("/operational_quanlity_score",  ShopStatisticsController.getOperationalQuanlityScore)

export default router