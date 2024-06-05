import express from 'express'
import ShopStatisticsController from '../controllers/statistics.shop.controller.js'

const router = express.Router()


router.post("/sales/total", ShopStatisticsController.getTotalSales)
router.post("/revenue/total", ShopStatisticsController.getTotalRevenue)
router.post("/conversion/view_and_sales", ShopStatisticsController.getConversionOfViewAndSales)

export default router