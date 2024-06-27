import express from 'express'
import StatisticsProductController from '../controllers/statistics.product.controller.js'
import VerificationService from '../services/verification.service.js'

const router = express.Router()

router.get("/welcome", (req, res, next) => {return res.json({
    message: "welcome to product path of Statistics Service",
    data: {}
})})


router.post("/top/in_global_sales", StatisticsProductController.getTopProductInGlobalSales)
router.post("/top/in_sales", StatisticsProductController.getTopProductInSalesBySeller)
router.post("/sold_amount/detail", StatisticsProductController.getSoldAmountOfProducts)
router.post("/sold_amount/all", StatisticsProductController.getSoldAmountOfAllProducts)
router.post("/views_viewers", StatisticsProductController.getViewsAndViewersOfProducts)
router.post("/add_to_cart", StatisticsProductController.getAddToCartAmountOfProducts)
router.post("/ratio/add_to_cart", StatisticsProductController.getAddToCartRatio)
router.post("/amount_of_buyers", StatisticsProductController.getAmountOfBuyersOfProducts)

export default router