import express from "express";
import OrderController from "./order.controller.js";

const router = express.Router();

router.get("/orders", OrderController.getAll);
router.get("/order/:id", OrderController.getById);
router.post("/order", OrderController.create);
router.put("/order/:id", OrderController.update);
router.delete("/order/:id", OrderController.delete);

export default router;
