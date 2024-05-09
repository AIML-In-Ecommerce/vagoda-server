import { ProductAttribute } from "../models/productAttribute.js";

const ProductAttributeService = {
  async getAll(filter, projection) {
    return await ProductAttribute.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await ProductAttribute.findById(id);
  },

  async create(objectData) {
    const newObject = new ProductAttribute(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await ProductAttribute.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await ProductAttribute.findByIdAndDelete(id);
  },

 
};

export default ProductAttributeService;
