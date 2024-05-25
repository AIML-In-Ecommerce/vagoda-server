import createError from "http-errors";
import WidgetService from "../services/widget.service.js";
const model = " widget ";
const Model = " Widget ";
const WidgetController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await WidgetService.getAll(filter, "");
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
      console.log("test");
      const { id } = req.params;
      console.log(id);
      const object = await WidgetService.getById(id);
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
    console.log("okkkkkkkkkkkkkkkkkk")
    try {
      const data = req.body;
      if (!req.files || req.files.length === 0) {
        return next(new Error("No file uploaded!"));
      }

      const imageUrls = req.files.map((file) => file.path);
      console.log(imageUrls);
      if (data.type === "BANNER" && imageUrls.length > 1) {
        data.element.images = imageUrls;
      }
      console.log(data);
      const object = await WidgetService.create(data);
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
      if (!req.files || req.files.length === 0) {
        return next(new Error("No file uploaded!"));
      }

      const imageUrls = req.files.map((file) => file.path);
      console.log(imageUrls);
      if (data.type === "BANNER" && imageUrls.length > 1) {
        data.element.images = imageUrls;
      }
      console.log(data);
      const object = await WidgetService.update(id, data);
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
      const object = await WidgetService.delete(id);
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

      const list = await WidgetService.getListByIds(ids);
      if (!list) {
        return next(createError.BadRequest("Widgets not found"));
      }
      res.json({
        message: "Get list of widget successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
};

export default WidgetController;
