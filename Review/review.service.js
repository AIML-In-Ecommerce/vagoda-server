import Review from "./review.model.js";

const ReviewService = {
  async getAll(filter, projection) {
    return await Review.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Review.findById(id);
  },

  async getByProductId(productId) {
    return await Review.find({ product: productId });
  },

  async create(objectData) {
    const newObject = new Review(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Review.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Review.findByIdAndDelete(id);
  },
};

export default ReviewService;
