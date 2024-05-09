import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CollectionTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  productIdList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const CollectionType = mongoose.model("CollectionType", CollectionTypeSchema);

export default CollectionType;
