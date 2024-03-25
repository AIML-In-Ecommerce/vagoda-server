import express from "express";
import CategoryController from "../controllers/category.controller.js";

const router = express.Router();

router.get("/categories", CategoryController.getAll);
router.get("/category/:id", CategoryController.getById);
router.post("/category", CategoryController.create);
router.put("/category/:id", CategoryController.update);
router.delete("/category/:id", CategoryController.delete);

export default router;
