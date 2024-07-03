import Comment from "../models/comment.model.js";
import Review from "../models/review.model.js";

const CommentService = {
  async getAll(filter, projection) {
    return await Comment.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Comment.findById(id);
  },

  async getByReviewId(reviewId) {
    return await Comment.find({ review: reviewId });
  },

  async create(objectData) {
    const newObject = new Comment(objectData);

    if (objectData.shop) {
      const review = await Review.findById(objectData.review)
        .populate({
          path: 'product',
          populate: {
            path: 'shop'
          }
        })
        .exec();
      console.log(review.product.shop._id.toString(), objectData.shop.toString());
      if (review.product.shop._id.toString() === objectData.shop.toString()) {
        review.isResponseByShop = true;
        await review.save();
      }
    }

    return await newObject.save();
  },

  async update(id, updateData) {
    return await Comment.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Comment.findByIdAndDelete(id);
  },
};

export default CommentService;
