import mongoose from "mongoose";

const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
  name: {
    type: String,
    required: true,
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
