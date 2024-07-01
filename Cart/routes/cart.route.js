import express from "express"
import CartController from "../controller/cart.controller.js";
import VerificationService from "../services/verification.service.js";
import SystemCartController from "../controller/system.cart.controller.js";

const router = express.Router();

// router.get("/carts", CartController.getAll);
// router.get("/cart/:id", CartController.getById);

// router.put("/cart/:id", CartController.update);

router.get("/cart/welcome", (req, res, next) => {return res.json({
    message: "welcome to cart path of Cart Service",
    data: {}
})})

// from buyer
router.get("/cart/user", CartController.getCartByUserId)
router.post("/cart/user/add", CartController.addToCart)
router.put("/cart/user/update", CartController.updateProducts)
router.put("/cart/user/clear", CartController.clearCart)


// from system
router.get("/system/cart/user", VerificationService.verifySystemRole, SystemCartController.getCartByUserId)
router.put("/system/cart/user", VerificationService.verifySystemRole, SystemCartController.updateProducts)
router.post("/system/cart/create", VerificationService.verifySystemRole, SystemCartController.create);
router.delete("/system/cart/delete", VerificationService.verifySystemRole, SystemCartController.delete);
router.put("/system/cart/user/clear", VerificationService.verifySystemRole, SystemCartController.clearCart)

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