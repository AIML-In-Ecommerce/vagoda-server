import User from "../models/user.model.js";

const UserService = {
  async getAll(filter, projection) {
    return await User.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await User.findById(id);
  },

  async create(objectData) {
    const newObject = new User(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await User.findByIdAndDelete(id);
  },
};

export default UserService;
