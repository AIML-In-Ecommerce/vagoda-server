import express from "express";
import ShopController from "./shop.controller.js";

const router = express.Router();

router.get("/shops", ShopController.getAll);
router.get("/shop/:id", ShopController.getById);
router.post("/shop", ShopController.create);
router.put("/shop/:id", ShopController.update);
router.delete("/shop/:id", ShopController.delete);

export default router;
