import mongoose from "mongoose";
import { DiscountType } from "./shared/enums";

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
    enum: Object.values(discountType),
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number
  },
  activeDate: {
    type: Date,
    required: true
  },
  expiredDate: {
    type: Date,
    required: true
  },
  saleCategory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Promotion = mongoose.model("Promotion", PromotionSchema);

export default Promotion;
