import Template from "../models/template.model.js";

const TemplateService = {
  async getAll(filter, projection) {
    return await Template.find(filter).select(projection).populate("design");
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Template.findById(id).populate("design");
  },

  async create(objectData) {
    const newObject = new Template(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Template.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Template.findByIdAndDelete(id);
  },

  //   async getListByIds(ids) {
  //     const list = await Template.find({ _id: { $in: ids } });
  //     return list;
  //   },
};

export default TemplateService;
