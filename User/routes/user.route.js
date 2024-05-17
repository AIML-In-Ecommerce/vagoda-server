import express from 'express';
import UserController from '../controllers/user.controller.js'
import AccountController from '../controllers/account.controller.js';
import uploadCloud from '../shared/uploader.js';

const router = express.Router();

router.get('/users', UserController.getAll);
router.get('/user/info', UserController.getById);
router.post('/user', uploadCloud.array('avatar'), UserController.create);
router.put('/user/info', uploadCloud.array('avatar'), UserController.update);
router.delete('/user/info', uploadCloud.array('avatar'), UserController.delete);
router.post('/user/register', UserController.register);
router.get("/user/shipping_address", UserController.getShippingAddress)
router.post('/user/shipping_address', UserController.insertShippingAddress)
router.put("/user/shipping_address", UserController.updateShippingAddress)
router.delete("/user/shipping_address", UserController.deleteShippingAddress)

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
