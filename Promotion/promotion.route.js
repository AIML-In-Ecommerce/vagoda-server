import express from "express";
import PromotionController from "./promotion.controller.js";

const router = express.Router();

router.get("/promotions", PromotionController.getAll);
router.get("/promotion/:id", PromotionController.getById);
router.post("/promotion", PromotionController.create);
router.put("/promotion/:id", PromotionController.update);
router.delete("/promotion/:id", PromotionController.delete);

export default router;
