import express from "express";
import SubCategoryTypeController from "../controllers/subCategoryType.controller.js";

const router = express.Router();

router.get("/subCategoryTypes", SubCategoryTypeController.getAll);
router.get("/subCategoryType/:id", SubCategoryTypeController.getById);
router.post("/subCategoryType", SubCategoryTypeController.create);
router.put("/subCategoryType/:id", SubCategoryTypeController.update);
router.delete("/subCategoryType/:id", SubCategoryTypeController.delete);

export default router;


/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategoryType:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         urlKey:
 *           type: string
 *         attributeName:
 *           type: string
 *         name:
 *           type: string
 *         subCategory:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /subCategoryTypes:
 *   get:
 *     responses:
 *       200:
 *         description: Return all subcategory types.
 */

/**
 * @swagger
 * /subCategoryType/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return subcategory type with corresponding ID.
 */

/**
 * @swagger
 * /subCategoryType:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new subcategory type.
 */

/**
 * @swagger
 * /subCategoryType/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update subcategory type successfully.
 */

/**
 * @swagger
 * /subCategoryType/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete subcategory type successfully.
 */
