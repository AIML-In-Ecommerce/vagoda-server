import express from "express";
import ShopController from "./controller/shop.controller.js";
import VerificationService from "./verification.service.js";
import SystemShopController from "./controller/system.shop.controller.js";

const router = express.Router();

router.get("/shops/welcome", (req, res, next) => {return res.json({
    message: "welcome to shop(s) path of Shop Service",
    data: {}
})})

router.get("/shop/welcome", (req, res, next) => {return res.json({
    message: "welcome to shop path of Shop Service",
    data: {}
})})

router.get("/shops", ShopController.getAll);
router.get("/shop/:id", ShopController.getById);
router.put("/shop/:id", ShopController.update);
router.get("/shop_info", ShopController.getShopBySelection)
router.post("/shops", ShopController.getShopByIdList)


// from system
router.post("/system/shops", ShopController.getShopByIdList)
router.post("/system/shop", VerificationService.verifySystemRole, ShopController.create);
router.delete("/system/shop", VerificationService.verifySystemRole, SystemShopController.delete);
router.get("/system/shop_info", VerificationService.verifySystemRole, ShopController.getShopBySelection)

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
