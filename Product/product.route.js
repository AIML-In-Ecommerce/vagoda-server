import express from 'express';
import ProductController from './product.controller.js';
import uploadCloud from './shared/uploader.js';

const router = express.Router();

router.get('/products', ProductController.getAll);
router.get('/product/:id', ProductController.getById);
router.post('/product', uploadCloud.array('[product]'), ProductController.create);
router.put('/product/:id', uploadCloud.array('[product]'),ProductController.update);
router.delete('/product/:id', uploadCloud.array('[product]'),ProductController.delete);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         attribute:
 *           type: object
 *         description:
 *           type: string
 *         originalPrice:
 *           type: number
 *         finalPrice:
 *           type: number
 *         category:
 *           type: string
 *         subCategory:
 *           type: array
 *           items:
 *             type: string
 *         shop:
 *           type: string
 *         platformFee:
 *           type: number
 *         status:
 *           type: string
 *           enum: ['AVAILABLE', 'SOLD_OUT', 'OUT_OF_STOCK']
 *         image:
 *           type: array
 *           items:
 *             type: string
 *         avgRating:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         requiredAttribute:
 *           type: object
 */

/**
 * @swagger
 * /products:
 *   get:
 *     responses:
 *       200:
 *         description: Return all products.
 */

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return product with corresponding ID.
 */

/**
 * @swagger
 * /product:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new product.
 */

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update product successfully.
 */

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete product successfully.
 */
