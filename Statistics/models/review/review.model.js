import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  asset: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  conversation: [
    {
      comment: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
  like: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    // autopopulate: true,
  },
  isResponseByShop: {
    type: Boolean,
    default: false,
  },
});
ReviewSchema.plugin(mongooseAutoPopulate);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
