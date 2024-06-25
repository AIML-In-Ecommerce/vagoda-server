import express from "express";
import AccountController from "../controllers/account.controller.js";
import VerificationService from "../services/verification.service.js";


const router = express.Router();

router.get("/account/welcome", (req, res, next) => {return res.json({
    message: "welcome to account path of Account Service",
    data: {}
})})

router.get("/accounts/welcome", (req, res, next) => {return res.json({
    message: "welcome to account(s) path of Account Service",
    data: {}
})})

router.get("/accounts", AccountController.getAll);
router.put("/account/:id", AccountController.update);


// from system
router.get("/system/account/:id", VerificationService.verifySystemRole, AccountController.getById);
router.post("/system/account", VerificationService.verifySystemRole, AccountController.create);
router.delete("/system/account/:id", VerificationService.verifySystemRole, AccountController.delete);
router.post("/system/account/email", VerificationService.verifySystemRole, AccountController.getByEmail)

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         registerType:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - 'ADMIN'
 *             - 'USER'
 *             - 'SHOP_OWNER'
 *         status:
 *           type: string
 *           enum:
 *             - 'ACTIVE'
 *             - 'INACTIVE'
 *             - 'BLOCKED'
 *         createAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     responses:
 *       200:
 *         description: Return all accounts.
 */

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return account with corresponding ID.
 */

/**
 * @swagger
 * /account:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new account.
 */

/**
 * @swagger
 * /account/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update account successfully.
 */

/**
 * @swagger
 * /account/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete account successfully.
 */
