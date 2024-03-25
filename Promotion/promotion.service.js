import Promotion from "./promotion.model.js";

const PromotionService = {
  async getAll(filter, projection) {
    return await Promotion.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Promotion.findById(id);
  },

  async create(objectData) {
    const newObject = new Promotion(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Promotion.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Promotion.findByIdAndDelete(id);
  },
};

export default PromotionService;
