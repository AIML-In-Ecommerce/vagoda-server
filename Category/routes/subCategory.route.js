import express from "express";
import SubCategoryController from "../controllers/subCategory.controller.js";

const router = express.Router();

router.get("/subCategories", SubCategoryController.getAll);
router.get("/subCategory/:id", SubCategoryController.getById);
router.post("/subCategory", SubCategoryController.create);
router.put("/subCategory/:id", SubCategoryController.update);
router.delete("/subCategory/:id", SubCategoryController.delete);

export default router;
