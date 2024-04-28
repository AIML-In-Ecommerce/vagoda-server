import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
  key: {
    type: String,
    required: false
  },
  urlKey: {
    type: String,
    required: false
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
