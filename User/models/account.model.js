import mongoose from "mongoose";
import { AccountRegisterType, AccountStatus, AccountType } from "../shared/enums.js";

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  registerType: {
    type: String,
    required: true,
    enum: Object.values(AccountRegisterType),
    default: AccountRegisterType.STANDARD,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(AccountType),
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(AccountStatus),
    default: AccountStatus.INACTIVE,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Account = mongoose.model("Account", AccountSchema);

export default Account;
