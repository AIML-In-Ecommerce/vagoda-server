import express from 'express';
import ProductController from './product.controller.js';

const router = express.Router();

router.get('/products', ProductController.getAll);
router.get('/product/:id', ProductController.getById);
router.post('/product', ProductController.create);
router.put('/product/:id', ProductController.update);
router.delete('/product/:id', ProductController.delete);

export default router;
