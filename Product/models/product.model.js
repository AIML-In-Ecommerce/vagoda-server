import mongoose from "mongoose";
import { ProductStatus } from "../shared/enums.js";
import Category from "./category.model.js";
import SubCategory from "./subCategory.model.js";
import SubCategoryType from "./subCategoryType.model.js";
import Shop from "./shop.model.js";
import mongooseAutoPopulate from "mongoose-autopopulate";
const Schema = mongoose.Schema;
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    text: true,
  },
  //   attributes: [
  //     attribute: {
  //     attribute:{
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "ProductAttribute",
  //       required: true,
  //     },
  //     value: {
  //     value:{
  //       type: String,
  //       required: true,
  //     }
  // ],
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
    autopopulate: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    autopopulate: true,
  },
  subCategoryType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategoryType",
    autopopulate: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  platformFee: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.AVAILABLE,
  },
  images: [{ type: String }],
  avgRating: {
    type: Number,
    default: 0,
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
  brand: {
    type: String,
    default: new String(""),
  },
  isFlashSale: {
    type: Boolean,
    default: false,
  },
  inventoryAmount: {
    type: Number,
    default: 0,
  },
  profit: {
    type: Number,
  },
  //There is size... material... warranty... place of manufacture only
  attribute: {
    colors: [
      {
        link: {
          type: String,
        },
        color: {
          label: { type: String },
          value: { type: String },
        },
      },
    ],
    size: { type: [String] },
    material: { type: String },
    warranty: { type: String },
    manufacturingPlace: { type: String },
  },
});
ProductSchema.plugin(mongooseAutoPopulate);
export const Product = mongoose.model("Product", ProductSchema);
