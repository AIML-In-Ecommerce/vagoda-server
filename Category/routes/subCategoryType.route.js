import express from "express";
import SubCategoryTypeController from "../controllers/subCategoryType.controller.js";

const router = express.Router();

router.get("/subCategoryTypes", SubCategoryTypeController.getAll);
router.get("/subCategoryType/:id", SubCategoryTypeController.getById);
router.post("/subCategoryType", SubCategoryTypeController.create);
router.put("/subCategoryType/:id", SubCategoryTypeController.update);
router.delete("/subCategoryType/:id", SubCategoryTypeController.delete);

export default router;
