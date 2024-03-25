import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ShopSchema = new Schema({
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
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
