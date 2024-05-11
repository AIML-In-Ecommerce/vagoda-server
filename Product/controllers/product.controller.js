import createError from "http-errors";
import ProductService from "../services/product.service";


const model = "product";
const Model = "Product";
const ProductController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.query;
      const list = await ProductService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await Product.getById(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await ProductService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const object = await ProductService.update(id, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await ProductService.delete(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Delete" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getListByIds: async (req, res, next) => {
    try {
      const { ids } = req.body; 
      const productList = await ProductService.getListByIds(ids);
      if (!productList) {
        return next(createError.BadRequest("Products not found"));
      }
      res.json({
        message: "Get list of products successfully",
        status: 200,
        data: productList,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getTopSelling: async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const topSellingProducts = await ProductService.getTopSelling(limit);
      res.json({
        message: "Get top selling products successfully",
        status: 200,
        data: topSellingProducts,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getFilteredProducts: async (req, res, next) => {
    try {
      const filterOptions = {
        keyword: req.query.keyword || '',
        shopId: req.query.shopId || '',
        price: req.query.price ? req.query.price.split(',').map(Number) : [],
        category: req.query.category || '',
        subCategory: req.query.subCategory || '',
        rating: req.query.rating ? req.query.rating.split(',').map(Number) : [],
        sortBy: req.query.sortBy || '',
        index: parseInt(req.query.index) || 0,
        amount: parseInt(req.query.amount) || 10 // Default amount per page is 10
      };

      const filteredProducts = await ProductService.getFilteredProducts(filterOptions);
      res.json(filteredProducts);
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
};

export default ProductController;
