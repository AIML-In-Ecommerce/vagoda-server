import express from 'express';
import WidgetController from '../controllers/widget.controller.js';
import uploadCloud from '../shared/uploader.js';

const router = express.Router();

router.get('/widgets', WidgetController.getAll);
router.get('/widget/:id', WidgetController.getById);
router.post('/widget', uploadCloud.array('avatar'), WidgetController.create);
router.put('/widget/:id', uploadCloud.array('avatar'), WidgetController.update);
router.delete('/widget/:id', WidgetController.delete);
router.post("/widgets/list", WidgetController.getListByIds);


export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *         dob:
 *           type: string
 *           format: date
 *         avatar:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         address:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               receiverName:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               coordinate:
 *                 type: object
 *                 properties:
 *                   lng:
 *                     type: number
 *                   lat:
 *                     type: number
 *               label:
 *                 type: string
 *                 enum:
 *                   - 'HOME'
 *                   - 'OFFICE'
 *               isDefault:
 *                 type: boolean
 *         account:
 *           type: string
 *         createAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users:
 *   get:
 *     responses:
 *       200:
 *         description: Return all users.
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return user with corresponding ID.
 */

/**
 * @swagger
 * /user:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new user.
 */

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update user successfully.
 */

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete user successfully.
 */
