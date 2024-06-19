import createError from "http-errors";
import ReviewService from "./services/review.service.js";
import CommentService from "./services/comment.service.js";
const model = "review";
const Model = "Review";
const ReviewController = {
  getAll: async (req, res, next) => {
    try {
      console.log("review");
      const filter = req.query;
      const list = await ReviewService.getAll(filter, "");
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
      const object = await ReviewService.getById(id);
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

  getByProductId: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const list = await ReviewService.getByProductId(productId);
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      res.json({
        message: "Get " + model + " list by productId successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await ReviewService.create(data);
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
      const object = await ReviewService.update(id, data);
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
      const object = await ReviewService.delete(id);
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
  createComment: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await CommentService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      await ReviewService.addCommentIdToReview(data.review, object._id);
      res.json({
        message: "Create" + " comment " + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  averageRating: async (req, res, next) => {
    try {
      const { productId } = req.params;
      const avg = await ReviewService.averageRating(productId) || 0;
      res.json({
        message: "Get average rating successfully",
        status: 200,
        data: avg,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
};

export default ReviewController;
