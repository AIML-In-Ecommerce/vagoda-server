import express from "express";
import AuthController from "./auth.controller.js";

const router = express.Router();

// router.post("/seller/register", AuthController.registerSeller);
// router.post("/buyer/register", AuthController.registerBuyer)
// router.post("/seller/login", AuthController.loginBySeller);
// router.post("/buyer/login", AuthController.loginByBuyer);


router.post("/auth/login", AuthController.login)
router.post("/auth/register/", AuthController.register)


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
