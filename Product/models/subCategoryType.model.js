import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubCategoryTypeSchema = new Schema({
  key: {
    type: String,
    required: false,
  },
  urlKey: {
    type: String,
    required: false,
  },
  attributeName: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
  
});

const SubCategoryType = mongoose.model(
  "SubCategoryType",
  SubCategoryTypeSchema
);

export default SubCategoryType;
