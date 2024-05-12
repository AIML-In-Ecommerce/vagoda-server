import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ShopInfoDesignSchema = new Schema({
  color: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  bannerUrl: {
    type: String,
    required: true,
  }
});

const ShopDetailSchema = new Schema({
  cancelPercentage: {
    type: Number,
    required: true,
  },
  refundPercentage: {
    type: Number,
    required: true,
  },
  sinceYear: {
    type: Number,
    required: true,
  },
  totalProductNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  rating: {
    type: Number,
  },
  replyPercentage: {
    type: Number,
  },
  address: {
    type: String,
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
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  design: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Widget",
  },
  shopInfoDesign: {
    type: ShopInfoDesignSchema,
  },
  shopDetail: {
    type: ShopDetailSchema,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
