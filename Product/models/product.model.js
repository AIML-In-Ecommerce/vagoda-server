import mongoose from "mongoose";
import { ProductStatus } from "../shared/enums.js";

const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  attributes: [
    attribute:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductAttribute",
      required: true,
    },
    value:{
      type: String,
      required: true,
    }
],
  description: {
    type: String,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  subCategory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  ],
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  platformFee:{
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.AVAILABLE,
  },
  image: {
    type: [String],
  },
  avgRating: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  requiredAttribute: {
    type: Object,
  },
  soldQuantity: {
    type: Number,
    default: 0,
  },
});

export const Product = mongoose.model("Product", ProductSchema);
