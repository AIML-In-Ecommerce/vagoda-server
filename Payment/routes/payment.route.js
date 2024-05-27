import express from "express";
import ZaloPayController from "../controllers/zalopay.controller.js";

const router = express.Router();

router.get("/", ZaloPayController.greeting)
router.post('/zalopay/payment', ZaloPayController.processPaymentRequest);
router.post('/zalopay/callback', ZaloPayController.callback);
router.post('/zalopay/check-status-order', ZaloPayController.checkStatusOrder);
router.post('/zalopay/refund', ZaloPayController.processRefundRequest);

export default router;

/**
 * @swagger
 * /zalopay/payment:
 *   post:
 *     responses:
 *       200:
 *         description: Process payment with ZaloPay.
 */

