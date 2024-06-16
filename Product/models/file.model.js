import mongoose from "mongoose";
import { ProductStatus } from "../shared/enums.js";
import Category from "./category.model.js";
import SubCategory from "./subCategory.model.js";
import SubCategoryType from "./subCategoryType.model.js";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { Product } from "./product.model.js";
const Schema = mongoose.Schema;
const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
    text: true,
  },
  url: {
    type: String,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
  },
  products: {
    type: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: Object.values(["SUCCESS", "FALURE"]),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// ProductSchema.plugin(mongooseAutoPopulate);
export const File = mongoose.model("File", FileSchema);
