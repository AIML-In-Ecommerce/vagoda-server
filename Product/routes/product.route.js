import express from "express";
import ProductController from "../controllers/product.controller.js";
import uploadCloud from "../shared/uploader.js";
import xlsxUploadLocal from "../shared/xlsx_upload_local.js";
import FileController from "../controllers/file.controller.js";

const router = express.Router();

router.get("/product/welcome", (req, res, next) => {return res.json({
  message: "welcome to product path of Product Service",
  data: {}
})})

router.get("/products/welcome", (req, res, next) => {return res.json({
  message: "welcome to product(s) path of Product Service",
  data: {}
})})

router.get("/products", ProductController.getAll);
router.get("/product/:id", ProductController.getById);
router.post("/product", uploadCloud.array("images"), ProductController.create);
router.put(
  "/product/:id",
  uploadCloud.array("[product]"),
  ProductController.update
);
router.delete(
  "/product/:id",
  uploadCloud.array("[product]"),
  ProductController.delete
);
router.post("/products/list", ProductController.getListByIds);
router.get("/products/top-selling", ProductController.getTopSelling);
router.post("/products/filter", ProductController.getFilteredProducts);

router.get("/related/:id", ProductController.relatedProduct);
router.get("/products/search", ProductController.searchProductsByKeyword);
router.post(
  "/import",
  xlsxUploadLocal.single("file"),
  ProductController.importProducts
);

router.get("/files", FileController.getAll);
router.get("/files/filter", FileController.filterFiles)

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         attribute:
 *           type: object
 *         description:
 *           type: string
 *         originalPrice:
 *           type: number
 *         finalPrice:
 *           type: number
 *         category:
 *           type: string
 *         subCategory:
 *           type: array
 *           items:
 *             type: string
 *         shop:
 *           type: string
 *         platformFee:
 *           type: number
 *         status:
 *           type: string
 *           enum: ['AVAILABLE', 'SOLD_OUT', 'SALE']
 *         image:
 *           type: array
 *           items:
 *             type: string
 *         avgRating:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         requiredAttribute:
 *           type: object
 */

/**
 * @swagger
 * /products:
 *   get:
 *     responses:
 *       200:
 *         description: Return all products.
 */

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return product with corresponding ID.
 */

/**
 * @swagger
 * /product:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new product.
 */

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update product successfully.
 */

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete product successfully.
 */

/**
 * @swagger
 * /products/list:
 *   post:
 *     summary: Get list of products by list of IDs
 *     description: Retrieve a list of products based on a list of IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Return list of products corresponding to the provided IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad Request - Invalid request body.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /products/top-selling:
 *   get:
 *     summary: Get top selling products
 *     description: Retrieve the list of top selling products based on sold quantity.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of top selling products to retrieve (default is 20).
 *     responses:
 *       200:
 *         description: Return list of top selling products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /products/filter:
 *   post:
 *     summary: Get filtered products
 *     description: Retrieve the list of products based on filter criteria.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search for in product name or description.
 *       - in: query
 *         name: shopId
 *         schema:
 *           type: string
 *         description: ID of the shop to filter products by.
 *       - in: query
 *         name: price
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         description: Price range to filter products by (lower bound, upper bound).
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: ID of the category to filter products by.
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *         description: ID of the sub-category to filter products by.
 *       - in: query
 *         name: rating
 *         schema:
 *           type: array
 *           items:
 *             type: number
 *         description: Rating range to filter products by (lower bound, upper bound).
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort criteria for the products (ascending price, descending price, top sale, highest rating, latest).
 *       - in: query
 *         name: index
 *         schema:
 *           type: integer
 *         description: Index of the page for pagination (default is 0).
 *       - in: query
 *         name: amount
 *         schema:
 *           type: integer
 *         description: Number of products per page for pagination (default is 10).
 *     responses:
 *       200:
 *         description: Return list of filtered products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal Server Error.
 */
