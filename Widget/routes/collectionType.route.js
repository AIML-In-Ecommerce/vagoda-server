import express from "express";
import CollectionTypeController from "../controllers/collectionType.controller.js";

const router = express.Router();

router.get("/collectionTypes", CollectionTypeController.getAll);
router.get("/collectionType/:id", CollectionTypeController.getById);
router.post("/collectionType", CollectionTypeController.create);
router.put("/collectionType/:id", CollectionTypeController.update);
router.delete("/collectionType/:id", CollectionTypeController.delete);

router.get("/collectionTypes/shop/:shopId", CollectionTypeController.getByShopId);
router.post("/collectionTypes/list", CollectionTypeController.getListByIds)

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
