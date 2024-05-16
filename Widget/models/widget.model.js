import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BannerElementSchema = new Schema({
  pattern: {
    type: String,
    enum: ["CAROUSEL"],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
});

const ProductElementSchema = new Schema({
  pattern: {
    type: String,
    enum: ["CAROUSEL", "GRID"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  collectionId: {
    type: String,
    required: true,
  },
});

const CategoryElementSchema = new Schema({
  pattern: {
    type: String,
    enum: ["GRID"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  categoryIdList: {
    type: [String],
    required: true,
  },
});

const PromotionElementSchema = new Schema({
  pattern: {
    type: String,
    enum: ["GRID"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  promotionIdList: {
    type: [Schema.Types.ObjectId], 
    ref: "Promotion",
  },
});

const CollectionElementSchema = new Schema({
  pattern: {
    type: String,
    enum: ["CAROUSEL", "GRID"],
    required: true,
  },
  collectionIdList: {
    type: [Schema.Types.ObjectId], // Thêm CollectionElement cho element của Widget
    ref: "CollectionType",
    required: true,
  },
});

// const ElementSchema = new Schema(
//   {
//     type: {
//       type: String,
//       enum: ["BannerElement", "ProductElement", "CategoryElement", "PromotionElement"],
//       required: true,
//     },
//     data: {
//       type: Schema.Types.Mixed,
//       required: true,
//     },
//   },
//   { _id: false }
// );

const WidgetSchema = new Schema({
  type: {
    type: String,
    enum: ["BANNER", "PRODUCT", "CATEGORY", "PROMOTION", "COLLECTION"],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  visibility: {
    type: Boolean,
    required: true,
  },
  element: {
    type: Schema.Types.Mixed,
  }
});

const Widget = mongoose.model("Widget", WidgetSchema);

export default Widget;
