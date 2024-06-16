import createError from "http-errors";
import FileService from "../services/file.service.js";
const model = "File";
const Model = "File";
const FileController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.query;
      const list = await FileService.getAll(filter, "");
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
      const object = await FileService.getById(id);
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
  getbyShopId: async (req, res, next) => {
    try {
      let shopId = req.params.shopId;
        if(shopId) {
            shopId = shopId.toString();
        }
      const object = await FileService.getByShopId(shopId);
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
};

export default FileController;
