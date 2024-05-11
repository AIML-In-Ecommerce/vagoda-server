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
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    require: false
  },
  subCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategoryType",
    require: false
  }]
});

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);

export default SubCategory;
