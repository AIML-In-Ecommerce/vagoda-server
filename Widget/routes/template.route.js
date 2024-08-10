import express from "express";
import TemplateController from "../controllers/template.controller.js";

const router = express.Router();

// router.get("/collectionType/welcome", (req, res, next) => {return res.json({
//     message: "welcome to collectionType path of Widget Service",
//     data: {}
// })})

// router.get("/collectionTypes/welcome", (req, res, next) => {return res.json({
//     message: "welcome to collectionType(s) path of Widget Service",
//     data: {}
// })})

router.get("/templates", TemplateController.getAll);
router.get("/template/:id", TemplateController.getById);
router.post("/template", TemplateController.create);
router.put("/template/:id", TemplateController.update);
router.delete("/template/:id", TemplateController.delete);

// router.get("/collectionTypes/shop/:shopId", CollectionTypeController.getByShopId);
// router.post("/collectionTypes/list", CollectionTypeController.getListByIds)

export default router;
