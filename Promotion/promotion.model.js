import mongoose from "mongoose";
import { DiscountType, PromotionStatus } from "./shared/enums.js";

const Schema = mongoose.Schema;

const PromotionDirectDiscountSchema = new Schema({
  value: {
    type: Number,
    default: 0
  },
  lowerBoundaryForOrder: {
    type: Number,
    default: 0
  }
}, {_id: false})

const PromotionPercentageDiscountSchema = new Schema({
  value: {
    type: Number,
    default: 0
  },
  lowerBoundaryForOrder: {
    type: Number,
    default: 0
  },
  limitAmountToReduce: {
    type: Number,
    default: Number.MAX_VALUE
  }
}, {_id: false})


const DiscountTypeInfoSchema = new Schema({},
  {
    discriminatorKey: "type",
    _id: false,
  }
)

const PromotionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  discountTypeInfo: {
    type: DiscountTypeInfoSchema,
    required: true
  },
  createAt:{
    type: Date,
    default: Date.now
  },
  activeDate: {
    type: Date,
    required: true
  },
  expiredDate: {
    type: Date,
    required: true
  },
  //note
  targetProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: () => []
  }],
  quantity: {
    type: Number,
    default: 0
  },
  redeemedTotal: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: Object.values(PromotionStatus),
    default: PromotionStatus.UPCOMMING
  },
  code: {
    type: String,
    required: true
  }
});

PromotionSchema.path("discountTypeInfo").discriminator(DiscountType.DIRECT_PRICE, PromotionDirectDiscountSchema)
PromotionSchema.path("discountTypeInfo").discriminator(DiscountType.PERCENTAGE, PromotionPercentageDiscountSchema)

const Promotion = mongoose.model("Promotion", PromotionSchema);

export default Promotion;
