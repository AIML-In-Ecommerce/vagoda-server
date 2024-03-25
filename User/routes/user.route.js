import express from 'express';
import UserController from '../controllers/account.controller.js';
import AccountController from '../controllers/account.controller.js';

const router = express.Router();

router.get('/users', UserController.getAll);
router.get('/user/:id', UserController.getById);
router.post('/user', UserController.create);
router.put('/user/:id', UserController.update);
router.delete('/user/:id', UserController.delete);

export default router;
