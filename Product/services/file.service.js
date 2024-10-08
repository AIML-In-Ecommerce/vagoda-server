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
  async filterByNameStatusDate(shopId, name, status, startDate, endDate) {
    const filter = {};
    if(shopId){
      filter.shop = shopId
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Tìm kiếm theo tên file (không phân biệt chữ hoa/chữ thường)
    }

    if (status) {
      filter.status = status; // Lọc theo trạng thái
    }

    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate }; // Lọc theo khoảng thời gian
    } else if (startDate) {
      filter.createdAt = { $gte: startDate }; // Lọc từ startDate trở đi
    } else if (endDate) {
      filter.createdAt = { $lte: endDate }; // Lọc đến endDate
    }

    return await File.find(filter);
  },
};

export default FileService;
