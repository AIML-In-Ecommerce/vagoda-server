import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
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
  },
  subCategoryType: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategoryType"
  }]
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;
