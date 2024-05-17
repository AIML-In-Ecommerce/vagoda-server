import createError from "http-errors";
import CategoryService from "../services/category.service.js";
import SubCategoryService from "../services/subCategory.service.js";
import SubCategoryTypeService from "../services/subCategoryType.service.js";
const model = "category";
const Model = "Category";
const CategoryController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.query;
      const list = await CategoryService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      console.log(list);
      for (var category of list) {
        const subcategories = await SubCategoryService.getAll(
          { category: category._id.toString() },
          ""
        );

        for (var subCategory of subcategories) {
          // console.log("sub: " + subCategory.name);
          const subcategorytypes = await SubCategoryTypeService.getAll({
            subCategory: subCategory._id.toString(),
          });
          //console.log(subCategory.name);
          subCategory.subCategories = subcategorytypes;
        }
        //console.log(" aaa subcategories: ", subcategories);
        category.subCategories = subcategories; // Gán danh sách subcategories vào thuộc tính subCategories của category
      }

      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await CategoryService.getById(id);
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
      const object = await CategoryService.create(data);
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
      const object = await CategoryService.update(id, data);
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
      const object = await CategoryService.delete(id);
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

      const list = await CategoryService.getListByIds(ids);
      if (!list) {
        return next(createError.BadRequest("Categories not found"));
      }
      res.json({
        message: "Get list of category successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
};

export default CategoryController;
