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

const ElementSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "BannerElement",
        "ProductElement",
        "CategoryElement",
        "PromotionElement",
      ],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (value) {
          switch (this.type) {
            case "BannerElement":
              return BannerElementSchema.validate(value);
              case "ProductElement":
                return ProductElementSchema.validate(value);
              case "CategoryElement":
                return CategoryElementSchema.validate(value);
              case "PromotionElement":
                return PromotionElementSchema.validate(value);
            default:
              return false;
          }
        },
        message: (props) =>
          `${props.path} is not a valid element for the specified type.`,
      },
    },
  },
  { _id: false }
);

const WidgetSchema = new Schema({
  type: {
    type: String,
    enum: ["BANNER", "PRODUCT", "CATEGORY", "PROMOTION"],
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
  element: ElementSchema,
});

const Widget = mongoose.model("Widget", WidgetSchema);

export default Widget;
