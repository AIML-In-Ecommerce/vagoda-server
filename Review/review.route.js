import express from 'express';
import ReviewController from './review.controller.js';

const router = express.Router();

router.get('/reviews', ReviewController.getAll);
router.get('/review/:id', ReviewController.getById);
router.post('/review', ReviewController.create);
router.put('/review/:id', ReviewController.update);
router.delete('/review/:id', ReviewController.delete);

router.get('/productReviews/:productId', ReviewController.getByProductId);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *         user:
 *           type: string
 *         rating:
 *           type: number
 *         content:
 *           type: string
 *         asset:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         conversation:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               content:
 *                 type: string
 *               asset:
 *                 type: string
 *         like:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     responses:
 *       200:
 *         description: Return all reviews.
 */

/**
 * @swagger
 * /review/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return review with corresponding ID.
 */

/**
 * @swagger
 * /review:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new review.
 */

/**
 * @swagger
 * /review/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update review successfully.
 */

/**
 * @swagger
 * /review/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete review successfully.
 */
