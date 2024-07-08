import express from "express";
import PromotionController from "./promotion.controller.js";
import SystemPromotionController from "./system.promotion.controller.js";

const router = express.Router();

router.get("/promotion/welcome", (req, res, next) => {return res.json({
    message: "welcome to promotion path of Promotion Service",
    data: {}
})})

router.get("/promotions/welcome", (req, res, next) => {return res.json({
    message: "welcome to promotion(s) path of Promotion Service",
    data: {}
  })})

// router.get("/promotion/", PromotionController.getAll);

router.get("/promotion/info", PromotionController.getById);
router.post("/promotion/list", PromotionController.getByIds);
router.post("/promotion/codes", PromotionController.getPromotionsWithCodes)
router.get("/promotion/shop/all", PromotionController.getByShopId);
router.post("/promotion/shop/selection", PromotionController.getPromotionBySelection)

router.post("/promotion/seller/create", PromotionController.create);
router.put("/promotion/seller/update", PromotionController.update);
router.delete("/promotion/seller/delete", PromotionController.delete);




//from system
router.put("/system/promotions/be_used", SystemPromotionController.updateUsedPromotionsQuantity)
router.put("/system/promotions/cancel", SystemPromotionController.updateCancelPromotionsQuantity)

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         discountType:
 *           type: string
 *           enum: ['PERCENTAGE', 'FIXED_AMOUNT']
 *         discountValue:
 *           type: number
 *         upperBound:
 *           type: number
 *         lowerBound:
 *           type: number
 *         quantity:
 *           type: number
 *         activeDate:
 *           type: string
 *           format: date-time
 *         expiredDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         code:
 *           type: string
 */

/**
 * @swagger
 * /promotions:
 *   get:
 *     responses:
 *       200:
 *         description: Return all promotions.
 */

/**
 * @swagger
 * /promotion/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return promotion with corresponding ID.
 */

/**
 * @swagger
 * /promotion:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new promotion.
 */

/**
 * @swagger
 * /promotion/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update promotion successfully.
 */

/**
 * @swagger
 * /promotion/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete promotion successfully.
 */
