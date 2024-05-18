import CollectionType from "../models/collectionType.model.js";

const CollectionTypeService = {
  async getAll(filter, projection) {
    return await CollectionType.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await CollectionType.findById(id);
  },

  async create(objectData) {
    const newObject = new CollectionType(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await CollectionType.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await CollectionType.findByIdAndDelete(id);
  },

  async getListByIds(ids) {
    const list = await CollectionType.find({ _id: { $in: ids } });
    return list;
  },
};

export default CollectionTypeService;
