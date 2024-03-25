import express from "express";
import UserController from "../controllers/account.controller.js";
import AccountController from "../controllers/account.controller.js";

const router = express.Router();

router.get("/accounts", AccountController.getAll);
router.get("/account/:id", AccountController.getById);
router.post("/account", AccountController.create);
router.put("/account/:id", AccountController.update);
router.delete("/account/:id", AccountController.delete);

export default router;
