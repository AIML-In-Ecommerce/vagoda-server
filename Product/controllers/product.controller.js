import createError from "http-errors";
import ProductService from "../services/product.service.js";
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
      const object = await ProductService.getById(id);
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
    console.log("test")
    try {
      const { ids } = req.body;
      console.log(ids)
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
        keyword: req.body.keyword || "",
        shopId: req.body.shopId || "",
        price: req.body.price ? req.body.price.split(",").map(Number) : [],
        category: req.body.category ? req.body.category.split(",") : [],
        subCategory: req.body.subCategory ? req.body.subCategory.split(",") : [],
        subCategoryTypes: req.body.subCategoryTypes ? req.body.subCategoryTypes.split(",") : [],
        rating: req.body.rating ? req.body.rating.split(",").map(Number) : [],
        sortBy: req.body.sortBy || "",
        index: parseInt(req.body.index) || 0,
        amount: parseInt(req.body.amount) || 20, // Default amount per page is 20
      };
      console.log(filterOptions.amount)
      const {filteredProducts, total} = await ProductService.getFilteredProducts(filterOptions); 
      const totalPages = Math.ceil(total / filterOptions.amount);
      console.log(filteredProducts.length ,total, totalPages)
      res.json({
        message: "Get filter " + model + " list successfully",
        status: 200,
        data: filteredProducts,
        total: total,
        totalPages: totalPages
    });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  
  
};

export default ProductController;
