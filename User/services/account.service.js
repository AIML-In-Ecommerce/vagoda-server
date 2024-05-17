import Account from "../models/account.model.js";
import { AccountRegisterType } from "../shared/enums.js";



const AccountService = {
  async getAll(filter, projection) {
    return await Account.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },
  async getByEmail(email) {
    return await Account.findOne({email: email});
  },

  async getById(id) {
    return await Account.findById(id);
  },

  async create(objectData) 
  {
    const newAccountConfig = 
    {
      email: objectData.email,
      password: objectData.password,
      type: objectData.accountType,
      registerType: objectData.registerType
    }

    const newAccountObject = new Account(newAccountConfig)
    const newAccount = await newAccountObject.save()
    return newAccount._id.toString()
  },

  async update(id, updateData) {
    return await Account.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    const deletedAccount = await Account.findByIdAndDelete(id);
    return deletedAccount._id
  },

};

export default AccountService;
