import Order from "./order.model.js";

const OrderService = {
  async getAll(filter, projection) {
    return await Order.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Order.findById(id);
  },

  async create(objectData) {
    const newObject = new Order(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Order.findByIdAndDelete(id);
  },
};

export default OrderService;
