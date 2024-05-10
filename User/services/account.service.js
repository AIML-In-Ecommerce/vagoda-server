import Account from "../models/account.model.js";

const AccountService = {
  async getAll(filter, projection) {
    return await Account.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },
  async check(email, password) {
    return await Account.findOne({ email, password });
  }

  async getById(id) {
    return await Account.findById(id);
  },

  async create(objectData) {
    const newObject = new Account(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Account.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Account.findByIdAndDelete(id);
  },
};

export default AccountService;
