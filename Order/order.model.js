import mongoose from "mongoose";
import { OrderStatus } from "./shared/enums.js";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
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
      quantity: {
        type: Number,
        required: true,
      },
      purchasePrice: {
        type: Number,
        required: true,
      },
    },
  ],
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
  },
  shippingFee: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: {
      receiverName: {
        type: String,
      },
      address: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      coordinate: {
        lng: {
          type: Number,
        },
        lat: {
          type: Number,
        },
      },
      label: {
        enum: ["HOME", "OFFICE"],
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  },
  orderStatus: [
    {
      status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDING,
        required: true,
      },
      complete: {
        type: Date,
        default: false,
      },
      time: {
        type: Date,
        default: Date.now,
      },
      deadline: {
        type: Date,
      },
    },
  ],
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
