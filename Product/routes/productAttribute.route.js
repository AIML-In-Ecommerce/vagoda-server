import express from "express";
import ProductAttributeController from "../controllers/productAttribute.controller.js";

const router = express.Router();

router.get("/productAttribute/welcome", (req, res, next) => {return res.json({
    message: "welcome to productAttribute path of Product Service",
    data: {}
})})

router.get("/productAttributes/welcome", (req, res, next) => {return res.json({
message: "welcome to productAttribute(s) path of Product Service",
data: {}
})})

router.get("/productAttributes", ProductAttributeController.getAll);
router.get("/productAttribute/:id", ProductAttributeController.getById);
router.post("/productAttribute", ProductAttributeController.create);
router.put("/productAttribute/:id", ProductAttributeController.update);
router.delete("/productAttribute/:id", ProductAttributeController.delete);

export default router;
