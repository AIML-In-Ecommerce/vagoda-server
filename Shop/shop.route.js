import express from "express";
import ShopController from "./shop.controller.js";

const router = express.Router();

router.get("/shops", ShopController.getAll);
router.post("/shops", ShopController.getShopByIdList)
router.get("/shop/:id", ShopController.getById);
router.post("/shop", ShopController.create);
router.put("/shop/:id", ShopController.update);
router.delete("/shop/:id", ShopController.delete);

router.get("/shop_info", ShopController.getShopBySelection)

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Shop:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         description:
 *           type: string
 *         createAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /shops:
 *   get:
 *     responses:
 *       200:
 *         description: Return all shops.
 */

/**
 * @swagger
 * /shop/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return shop with corresponding ID.
 */

/**
 * @swagger
 * /shop:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new shop.
 */

/**
 * @swagger
 * /shop/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update shop successfully.
 */

/**
 * @swagger
 * /shop/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete shop successfully.
 */
