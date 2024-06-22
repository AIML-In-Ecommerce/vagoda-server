import express from "express";
import ZaloPayController from "../controllers/zalopay.controller.js";
import VerificationService from "../services/verification.service.js";

const router = express.Router();

router.get("/payment/welcome", (req, res, next) => {return res.json({
    message: "welcome to payment path of Payment Service",
    data: {}
})})

router.post('/payment/zalopay/callback', ZaloPayController.callback);

//from system
router.post('/system/zalopay/payment', VerificationService.verifySystemRole, ZaloPayController.processPaymentRequest);
router.post('/system/zalopay/check-status-order', VerificationService.verifySystemRole, ZaloPayController.checkStatusOrder);
router.post('/system/zalopay/refund', VerificationService.verifySystemRole, ZaloPayController.processRefundRequest);

export default router;

/**
 * @swagger
 * /zalopay/payment:
 *   post:
 *     responses:
 *       200:
 *         description: Process payment with ZaloPay.
 */

