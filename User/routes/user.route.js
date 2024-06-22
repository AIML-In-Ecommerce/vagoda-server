import express from 'express';
import UserController from '../controllers/user.controller.js'
import AccountController from '../controllers/account.controller.js';
import uploadCloud from '../shared/uploader.js';
import VerificationService from '../services/verification.service.js';
import SystemUserController from '../controllers/system.user.controller.js';

const router = express.Router();

router.get("/user/welcome", (req, res, next) => {return res.json({
    message: "welcome to user path of User Service",
    data: {}
})})

router.get("/users/welcome", (req, res, next) => {return res.json({
    message: "welcome to user(s) path of User Service",
    data: {}
})})

router.get("/user_info/welcome", (req, res, next) => {return res.json({
    message: "welcome to user_info path of User Service",
    data: {}
})})

router.get('/users', UserController.getAll);
router.get('/user/:id', UserController.getById);
router.put('/user/:id', uploadCloud.array('avatar'), UserController.update);

// from user
router.get("/user_info", UserController.getUserInfo)
router.post("/user_info/list", UserController.getListOfUserInfos)
router.get("/user_info/shipping_address", UserController.getShippingAddress)
router.post('/user_info/shipping_address', UserController.insertShippingAddress)
router.put("/user_info/shipping_address", UserController.updateShippingAddress)
router.delete("/user_info/shipping_address", UserController.deleteShippingAddress)

// from system
// will not be presented on the the api gateway
router.post('/system/user', VerificationService.verifySystemRole, uploadCloud.array('avatar'), SystemUserController.create);
router.delete('/system/user/:id', VerificationService.verifySystemRole, uploadCloud.array('avatar'), SystemUserController.delete);
router.post('/system/user/register', VerificationService.verifySystemRole, SystemUserController.register);


router.get("/system/user_info", VerificationService.verifySystemRole, SystemUserController.getUserInfo)
router.post("/system/user_info/list", VerificationService.verifySystemRole, SystemUserController.getListOfUserInfos)
router.get("/system/user_info/shipping_address", VerificationService.verifySystemRole, SystemUserController.getShippingAddress)
router.post('/system/user_info/shipping_address', VerificationService.verifySystemRole, SystemUserController.insertShippingAddress)
router.put("/system/user_info/shipping_address", VerificationService.verifySystemRole, SystemUserController.updateShippingAddress)
router.delete("/system/user_info/shipping_address", VerificationService.verifySystemRole, SystemUserController.deleteShippingAddress)


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
