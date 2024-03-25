import Category from "../models/category.model.js";

const CategoryService = {
  async getAll(filter, projection) {
    return await Category.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Category.findById(id);
  },

  async create(objectData) {
    const newObject = new Category(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Category.findByIdAndDelete(id);
  },
};

export default CategoryService;
