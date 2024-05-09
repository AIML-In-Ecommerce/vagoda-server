import express from "express";
import ProductAttributeController from "../controllers/productAttribute.controller.js";

const router = express.Router();

router.get("/productAttributes", ProductAttributeController.getAll);
router.get("/productAttribute/:id", ProductAttributeController.getById);
router.post("/productAttribute", ProductAttributeController.create);
router.put("/productAttribute/:id", ProductAttributeController.update);
router.delete("/productAttribute/:id", ProductAttributeController.delete);

export default router;
