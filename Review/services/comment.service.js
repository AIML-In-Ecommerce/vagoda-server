import Comment from "../models/comment.model.js";

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
