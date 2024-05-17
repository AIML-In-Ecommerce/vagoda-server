import express from "express";
import CategoryController from "../controllers/category.controller.js";
import uploadCloud from "../shared/uploader.js";

const router = express.Router();

router.get("/categories", CategoryController.getAll);
router.get("/category/:id", CategoryController.getById);
router.post(
  "/category",
  uploadCloud.single("category"),
  CategoryController.create
);
router.put(
  "/category/:id",
  uploadCloud.single("category"),
  CategoryController.update
);
router.delete(
  "/category/:id",
  uploadCloud.single("category"),
  CategoryController.delete
);
router.post("/categories/list", CategoryController.getListByIds)

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
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
 *         subCategoryType:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     responses:
 *       200:
 *         description: Return all categories.
 */

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return category with corresponding ID.
 */

/**
 * @swagger
 * /category:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new category.
 */

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update category successfully.
 */

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete category successfully.
 */
