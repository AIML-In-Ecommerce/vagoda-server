import Shop from "./shop.model.js";
const ShopService = {
  async getAll(filter, projection) {
    return await Shop.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Shop.findById(id);
  },

  async create(objectData) {
    const newObject = new Shop(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Shop.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Shop.findByIdAndDelete(id);
  },
};

export default ShopService;
