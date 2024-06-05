import express from "express"
import StatisticsOrderController from "../controllers/statistics.order.controller.js"

const router = express.Router()


router.post("/status", StatisticsOrderController.getOrderStatisticsByShopWithStatus)

router.post("/latest_status", StatisticsOrderController.getOrderStatisticsByShopWithLatestStatus)

router.post("/received", StatisticsOrderController.getTotalReceivedOrders)

router.post("/late_pending_processing", StatisticsOrderController.getLatePendingAndProcessingOrdersInIntervalOfTime)

router.post("/on_time_pending_processing", StatisticsOrderController.getOnTimePendingAndProcessingOrdersInIntervalOfTime)

router.post("/waiting_for_process", StatisticsOrderController.getOrdersWithOnWaitingForStatus)

router.post("/late_in_process", StatisticsOrderController.getLateOrdersByShopWithStatus)

router.post("/on_time_process", StatisticsOrderController.getOnTimeOrdersByShopIdWithStatus)

export default router
