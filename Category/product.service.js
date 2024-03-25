import { Product } from "./product.model.js";

const ProductService = {
  async getAll(filter, projection) {
    return await Product.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Product.findById(id);
  },

  async create(objectData) {
    const newObject = new Product(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  },
};

export default ProductService;
