import { File } from "../models/file.model.js";

const FileService = {
  async getAll(filter, projection) {
    return await File.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    const rawProductInfo = await File.findById(id);
    return rawProductInfo;
  },
  async getByShopId(shopId) {
    const list = await File.find({ shop: shopId });
    return list;
  },

  async create(objectData) {
    const newObject = new File(objectData);
    return await newObject.save();
  },
};

export default FileService;
