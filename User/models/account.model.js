import mongoose from "mongoose";
import { AccountStatus, AccountType } from "../shared/enums.js";

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
  },
  registerType: {
    type: mongoose.Schema.Types.ObjectId,
  },
  type: {
    type: String,
    enum: Object.values(AccountType),
  },
  status: {
    type: String,
    enum: Object.values(AccountStatus),
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Account = mongoose.model("Account", AccountSchema);

export default Account;
