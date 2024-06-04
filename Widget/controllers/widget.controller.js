import createError from "http-errors";
import WidgetService from "../services/widget.service.js";
import { deleteFileByUrl } from "../shared/uploader.js";
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
    try {
      const data = req.body;
      if (!req.files || req.files.length === 0) {
        console.log("no file uploaded");
      } else {
        console.log(req.files);
        const imageUrls = req.files.map((file) => file.path);
        console.log(imageUrls);
        if (data.type === "BANNER" && imageUrls.length > 1) {
          data.element.images = imageUrls;
        }
        console.log(data);
      }

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
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;
      if (!req.files || req.files.length === 0) {
        console.log("No file uploaded!");
      } else {
        const imageUrls = req.files.map((file) => file.path);
        console.log(imageUrls);
        if (data.type === "BANNER" && imageUrls.length > 1) {
          data.element.images = imageUrls;
        }
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
  upload: async (req, res, next) => {
    console.log("okkkkkkkkkkkkkkkkkk");
    console.log(req.body);
    try {
      // const data = req.body;
      if (!req.files && !req.file) {
        console.log("no file uploaded");

        res.json({
          message: "no file uploaded",
          status: 200,
          data: {
            path: null,
          },
        });
      } else {
        res.json({
          message: "upload file successfully",
          status: 200,
          data: {
            path: req.file.path,
          },
        });
      }

      // console.log(req.file.path);
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  deleteFile: async (req, res, next) => {
    const url = req.body.url 
    if(!url){
      return next(createError.BadRequest("Url can not be empty"))
    }
    try {
      // const data = req.body;
      await deleteFileByUrl(url)
      res.json({
        message: "delete file successfully",
        status: 200,
        data: {
          path: url,
        },
      })
      

      // console.log(req.file.path);
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
};

export default WidgetController;
