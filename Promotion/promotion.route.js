import express from "express";
import PromotionController from "./promotion.controller.js";

const router = express.Router();

router.get("/promotions", PromotionController.getAll);
router.post("/promotions", PromotionController.getByIds);
router.get("/promotion/:id", PromotionController.getById);
router.post("/promotion", PromotionController.create);
router.put("/promotion/:id", PromotionController.update);
router.delete("/promotion/:id", PromotionController.delete);

router.post("/promotions/list", PromotionController.getListByIds);

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
