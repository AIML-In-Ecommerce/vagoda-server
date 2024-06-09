import mongoose from "mongoose";
import User from "./user.model.js";
import mongooseAutoPopulate from "mongoose-autopopulate";

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  review: {
    type: Schema.Types.ObjectId,
    ref: "Review",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    autopopulate: true,
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
CommentSchema.plugin(mongooseAutoPopulate);
const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
