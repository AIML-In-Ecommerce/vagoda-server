import express from 'express'
import StatisticsProductController from '../controllers/statistics.product.controller.js'

const router = express.Router()


router.post("/top/in_sales", StatisticsProductController.getTopProductInSalesBySeller)


export default router