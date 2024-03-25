import mongoose from "mongoose";
import { OrderStatus } from '../shared/enums.js;

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion"
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId
  },
  shippingFee: {
    type: Number
  },
  totalPrice: {
    type: Number,
    required: true
  },
  orderStatus: [{
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true
    },
    time: {
      type: Date,
      default: Date.now
    }
  }]
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
