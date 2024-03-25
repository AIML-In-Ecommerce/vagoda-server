import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubCategoryTypeSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  urlKey: {
    type: String,
    required: true,
  },
  attributeName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subCategory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
  ],
});

const SubCategoryType = mongoose.model(
  "SubCategoryType",
  SubCategoryTypeSchema
);

export default SubCategoryType;
