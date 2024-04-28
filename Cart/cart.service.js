import { Cart } from "./cart.model.js";

const CartService = {
  async getAll(filter, projection) {
    return await Cart.find(filter).select(projection)
    .populate({
      path: 'products.product',
      model: 'Product',
    })
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Cart.findById(id);
  },

  async create(objectData) {
    const newObject = new Cart(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Cart.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Cart.findByIdAndDelete(id);
  },
};

export default CartService;
