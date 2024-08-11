import mongoose from "mongoose";

const Schema = mongoose.Schema;

// create child schema "bank card for shop schema":
// bankcard {
//   bankName: TP Bank
//   owner: Nguyễn Võ Minh Trí
//   accountNUmber: 002984010192
// }

const WalletSchema = new Schema({
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  bankCard: {
    type: [BankCardSchema],
    default: [],
  },
});

const BankCardSchema = new Schema({
  bankName: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
});

const ShopInfoDesignSchema = new Schema({
  color: {
    type: String,
    // required: true,
    default: "white",
  },
  avatarUrl: {
    type: String,
    // required: true,
    default: new String(""),
  },
  bannerUrl: {
    type: String,
    // required: true,
    default: new String(""),
  },
});

const ShopDetailSchema = new Schema({
  cancelPercentage: {
    type: Number,
    required: true,
    default: 0.0,
  },
  refundPercentage: {
    type: Number,
    required: true,
    default: 0.0,
  },
  sinceYear: {
    type: Number,
    required: true,
    default: new Date(Date.now()).getFullYear(),
  },
  totalProductNumber: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 5.0,
  },
  replyPercentage: {
    type: Number,
    default: 0.0,
  },
  operationalQuality: {
    type: Number,
    default: 5,
  },
});

const ShopSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/128/1653/1653671.png",
  },
  location: {
    type: String,
    required: true,
    default: "TP Hồ Chí Minh",
  },
  description: {
    type: String,
    default: "",
  },
  design: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Widget",
  },
  shopInfoDesign: {
    type: ShopInfoDesignSchema,
    required: true,
    default: () => ({}),
  },
  shopDetail: {
    type: ShopDetailSchema,
    required: true,
    default: () => ({}),
  },
  imageCollection: {
    type: [String],
    default: [],
  },
  wallet: {
    type: WalletSchema,
    required: true,
    default: () => ({}),
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
