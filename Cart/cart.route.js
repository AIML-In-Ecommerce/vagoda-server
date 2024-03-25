import express from "express";
import CartController from "./cart.controller.js";

const router = express.Router();

router.get("/carts", CartController.getAll);
router.get("/cart/:id", CartController.getById);
router.post("/cart", CartController.create);
router.put("/cart/:id", CartController.update);
router.delete("/cart/:id", CartController.delete);

export default router;
