import express from "express";
import CartController from "./cart.controller.js";

const router = express.Router();

router.get("/carts", CartController.getAll);
router.get("/cart/:id", CartController.getById);
router.post("/cart", CartController.create);
router.put("/cart/:id", CartController.update);
router.delete("/cart/:id", CartController.delete);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: integer
 */

/**
 * @swagger
 * /carts:
 *   get:
 *     responses:
 *       200:
 *         description: Trả về tất cả các giỏ hàng.
 */

/**
 * @swagger
 * /cart/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về giỏ hàng với ID tương ứng.
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     responses:
 *       200:
 *         description: Tạo mới một giỏ hàng.
 */

/**
 * @swagger
 * /cart/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật giỏ hàng thành công.
 */

/**
 * @swagger
 * /cart/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa giỏ hàng thành công.
 */