import Widget from "../models/widget.model.js";

const WidgetService = {
  async getAll(filter, projection) {
    return await Widget.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Widget.findById(id);
  },

  async create(objectData) {
    const newObject = new Widget(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Widget.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Widget.findByIdAndDelete(id);
  },
};

export default WidgetService;
