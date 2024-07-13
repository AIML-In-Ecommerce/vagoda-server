import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ShopInfoDesignSchema = new Schema({
  color: {
    type: String,
    // required: true,
    default: "white"
  },
  avatarUrl: {
    type: String,
    // required: true,
    default: new String(""),
  },
  bannerUrl: {
    type: String,
    // required: true,
    default: new String("")
  }
});

const ShopDetailSchema = new Schema({
  cancelPercentage: {
    type: Number,
    required: true,
    default: 0.0000,
  },
  refundPercentage: {
    type: Number,
    required: true,
    default: 0.0000,
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
    default: 5.0
  },
  replyPercentage: {
    type: Number,
    default: 0.0000
  },
  operationalQuality: {
    type: Number,
    default: 5
  }
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
    default: "https://cdn-icons-png.flaticon.com/128/1653/1653671.png"
  },
  location: {
    type: String,
    required: true,
    default: "TP Hồ Chí Minh"
  },
  description: {
    type: String,
    default: ""
  },
  design: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Widget",
  },
  shopInfoDesign: {
    type: ShopInfoDesignSchema,
    required: true,
    default: () => ({})
  },
  shopDetail: {
    type: ShopDetailSchema,
    required: true,
    default: () => ({})
  },
  imageCollection: {
    type: [String],
    default: []
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
