import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  usage: {
    type: Number,
    default: 0,
  },
  design: {
    // design is an array of widget object id
    type: [Schema.Types.ObjectId],
    ref: "Widget",
  },
});

const Template = mongoose.model("Template", TemplateSchema);

export default Template;
