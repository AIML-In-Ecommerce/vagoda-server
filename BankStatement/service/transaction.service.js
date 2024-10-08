import Transaction from "../model/transaction.model.js";
import axios from "axios";

const TransactionService = {
  async getAll(filter, projection) {
    return await Transaction.find(filter).select(projection);
  },
  async getById(id) {
    const rawTransactionInfo = await Transaction.findById(id);
    return rawTransactionInfo;
  },
  async getByShopId(shopId) {
    const list = await Transaction.find({ shop: shopId });
    return list;
  },
  async create(objectData) {
    const newObject = new Transaction(objectData);
    return await newObject.save();
  },
  async filter(_id, shopId, category, startDate, endDate) {
    const filter = {};
    if (_id) {
      filter._id = _id;
    }
    if (shopId) {
      filter.shop = shopId;
    }
    if (category) {
      filter.transactionCategory = category;
    }
    if (startDate && endDate) {
      filter.createAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.createAt = { $gte: startDate };
    } else if (endDate) {
      filter.createAt = { $lte: endDate };
    }
    return await Transaction.find(filter);
  },
  async getShopById(shopId) {
    const url = `http://14.225.218.109:3004/shop/${shopId}`;
    const response = await axios.get(url);
    const shop = response.data.data;
    return shop;
  },
  //update shop wallet balance
  //   {
  //     "wallet": {
  //         "balance": 120
  //     }
  // }
  async updateShopBalance(shopId, balance) {
    const url = `http://14.225.218.109:3004/shop/${shopId}`;
    const response = await axios.put(url, { wallet: { balance } });
    return response.data.data;
  },
};

export default TransactionService;

// import { File } from "../models/file.model.js";

// const FileService = {
//   async getAll(filter, projection) {
//     return await File.find(filter).select(projection);
//   },
//   // async getAll() {
//   //   return await AuthorizeRequest.find();
//   // },

//   async getById(id) {
//     const rawProductInfo = await File.findById(id);
//     return rawProductInfo;
//   },
//   async getByShopId(shopId) {
//     const list = await File.find({ shop: shopId });
//     return list;
//   },

//   async create(objectData) {
//     const newObject = new File(objectData);
//     return await newObject.save();
//   },
//   async filterByNameStatusDate(shopId, name, status, startDate, endDate) {
//     const filter = {};
//     if(shopId){
//       filter.shop = shopId
//     }

//     if (name) {
//       filter.name = { $regex: name, $options: 'i' }; // Tìm kiếm theo tên file (không phân biệt chữ hoa/chữ thường)
//     }

//     if (status) {
//       filter.status = status; // Lọc theo trạng thái
//     }

//     if (startDate && endDate) {
//       filter.createdAt = { $gte: startDate, $lte: endDate }; // Lọc theo khoảng thời gian
//     } else if (startDate) {
//       filter.createdAt = { $gte: startDate }; // Lọc từ startDate trở đi
//     } else if (endDate) {
//       filter.createdAt = { $lte: endDate }; // Lọc đến endDate
//     }

//     return await File.find(filter);
//   },
// };

// export default FileService;
