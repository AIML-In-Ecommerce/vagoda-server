import SubCategoryType from "../models/subCategoryType.model.js";

const SubCategoryTypeService = {
  async getAll(filter, projection) {
    return await SubCategoryType.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await SubCategoryType.findById(id);
  },

  async create(objectData) {
    const newObject = new SubCategoryType(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await SubCategoryType.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  },

  async delete(id) {
    return await SubCategoryType.findByIdAndDelete(id);
  },
};

export default SubCategoryTypeService;
