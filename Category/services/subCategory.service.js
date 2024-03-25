import SubCategory from "../models/subCategory.model.js";

const SubCategoryService = {
  async getAll(filter, projection) {
    return await SubCategory.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await SubCategory.findById(id);
  },

  async create(objectData) {
    const newObject = new SubCategory(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await SubCategory.findByIdAndDelete(id);
  },
};

export default SubCategoryService;
