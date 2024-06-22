import mongoose from "mongoose";

const ColorInProductInCart = new mongoose.Schema({
  link: {
    type: String
  },
  color: {
    label: {
      type: String,
    },
    value: {
      type: String
    }
  }
}, {_id: false})

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: {
        type: ColorInProductInCart,
        default: null
      },
      size: {
        type: String,
        default: null
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
});

export const Cart = mongoose.model("Cart", cartSchema);
