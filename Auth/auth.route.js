import express from "express";
import AuthController from "./auth.controller.js";
import VerificationService from "./verification.service.js";

const router = express.Router();

// router.post("/seller/register", AuthController.registerSeller);
// router.post("/buyer/register", AuthController.registerBuyer)
// router.post("/seller/login", AuthController.loginBySeller);
// router.post("/buyer/login", AuthController.loginByBuyer);

router.get("/auth/welcome", (req, res, next) => {return res.json({
    message: "welcome to auth path of Auth Service",
    data: {}
})})
  

router.post("/auth/login",AuthController.login)
router.post("/auth/register/", AuthController.register)
router.post("/auth/refresh_token", AuthController.refreshToken)
router.post("/auth/logout", AuthController.logout)

router.post("/auth/session", AuthController.getSessionId)
router.delete("/auth/session", AuthController.removeSession)

// from system
router.post("/system/auth/verify/access_token", VerificationService.verifySystemRole, AuthController.verifyAccessToken)
router.post("/system/auth/verify/sessionId", VerificationService.verifySystemRole, AuthController.verifySessionId)
// router.post("/auth/verify/system")

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
