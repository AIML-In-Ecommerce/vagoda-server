import mongoose from "mongoose";
import { DiscountType } from "./shared/enums.js";

const Schema = mongoose.Schema;

const PromotionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  discountType: {
    type: String,
    enum: Object.values(DiscountType),
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  upperBound: {
    type: Number,
    required: true
  },
  lowerBound: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number
  },
  activeDate: {
    type: Number,
    required: true
  },
  expiredDate: {
    type: Number,
    required: true
  },
  // saleCategory: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Category"
  // }],
  createdAt: {
    type: Number,
    default: Date.now
  },
  code: {
    type: String,
    required: true
  }
});

const Promotion = mongoose.model("Promotion", PromotionSchema);

export default Promotion;
