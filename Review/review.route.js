import express from 'express';
import ReviewController from './review.controller.js';

const router = express.Router();

router.get('/reviews', ReviewController.getAll);
router.get('/review/:id', ReviewController.getById);
router.post('/review', ReviewController.create);
router.put('/review/:id', ReviewController.update);
router.delete('/review/:id', ReviewController.delete);

export default router;
