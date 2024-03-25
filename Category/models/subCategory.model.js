import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
  key: {
    type: String,
    required: true
  },
  urlKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);

export default SubCategory;
