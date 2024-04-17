import express from "express";
import SubCategoryController from "../controllers/subCategory.controller.js";
import uploadCloud from "../shared/uploader.js";

const router = express.Router();

router.get("/subCategories", SubCategoryController.getAll);
router.get("/subCategory/:id", SubCategoryController.getById);
router.post("/subCategory", uploadCloud.single('subCategory'),SubCategoryController.create);
router.put("/subCategory/:id", uploadCloud.single('subCategory'), SubCategoryController.update);
router.delete("/subCategory/:id", uploadCloud.single('subCategory'), SubCategoryController.delete);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategory:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         urlKey:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 */

/**
 * @swagger
 * /subCategories:
 *   get:
 *     responses:
 *       200:
 *         description: Return all subcategories.
 */

/**
 * @swagger
 * /subCategory/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return subcategory with corresponding ID.
 */

/**
 * @swagger
 * /subCategory:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new subcategory.
 */

/**
 * @swagger
 * /subCategory/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update subcategory successfully.
 */

/**
 * @swagger
 * /subCategory/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete subcategory successfully.
 */
