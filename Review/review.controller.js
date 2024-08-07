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
        length: list.length,
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

      //if this is a shop's comment => update isResponseByShop attribute to TRUE
      await ReviewService.update(object.review.toString(), {isResponseByShop: true})

      res.json({
        message: "Create" + " comment " + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      console.log(error)
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
        data: avg.toFixed(2),
      })
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getFilteredReviews: async (req, res, next) => {
    try {
      const filterOptions = {
        shop: req.body.shopId || "", //shop id
        product: req.body.product || "", // product.name contains 
        category: req.body.category || "", //category id
        rating: req.body.rating || null,
        isResponse: req.body.isResponse,
        index: parseInt(req.body.index) || 1,
        amount: parseInt(req.body.amount) || 20, // Default amount per page is 20
        sortBy: req.body.sortBy || "",
      };
      console.log(req.body);
      console.log(filterOptions);
      if (filterOptions.index < 1) filterOptions.index = 1;
      const { filteredReviews, total } =
        await ReviewService.getFilteredReviews(filterOptions);
      const totalPages = Math.ceil(total / filterOptions.amount);
      // console.log(filteredProducts.length ,total, totalPages)
      res.json({
        message: "Get filter " + model + " list successfully",
        status: 200,
        data: filteredReviews,
        total: total,
        totalPages: totalPages,
        length: filteredReviews.length
      });
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  // get all comment
  getAllComment: async (req, res, next) => {
    try {
      const filter = req.query;
      const list = await CommentService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest("Comment list not found"));
      }
      res.json({
        message: "Get comment list successfully",
        status: 200,
        data: list,
        length: list.length,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getProductReviewsContent: async (req, res, next) =>
  {
    try {
      const { productId } = req.params;
      const list = await ReviewService.getByProductId(productId);
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      const listOfContents = list.map((record) =>
      {
        return record.content
      })

      res.json({
        message: "Get " + model + " list by productId successfully",
        status: 200,
        data: listOfContents,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  }
};

export default ReviewController;
