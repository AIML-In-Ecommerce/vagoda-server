import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
  },
  asset: {
    type: [String],
  },
  createdAt: {
    type: Date, 
    default: Date.now, 
  },
  cconversation: [CommentSchema],
  like: {
    type: [Schema.Types.ObjectId], // Sử dụng mảng của ObjectId
    ref: "User",
  },
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
