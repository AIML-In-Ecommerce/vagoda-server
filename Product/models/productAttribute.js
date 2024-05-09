import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ProductAttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  
});

export const ProductAttribute = mongoose.model("ProductAttribute", ProductAttributeSchema);
