import express from "express"
import VerificationService from "../services/verification.service.js"
import StatisticsCategoryController from "../controllers/statistics.category.controller.js"


const router = express.Router()


router.post("/global_sub_category/top/in_sales", StatisticsCategoryController.getTopInSalesSubCategories)


export default router