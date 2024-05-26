import mongoose from "mongoose";
import { OrderStatus, PaymentMethod } from "./shared/enums.js";

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  shop:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shop",
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
      purchasedPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
    default: null
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.COD
  },
  shippingFee: {
    type: Number,
    default: 0
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
      street:{
        type: String,
      },
      idProvince: {
        type: String,
      },
      idDistrict: {
        type: String,
      },
      idCommune: {
        type: String,
      },
      country: {
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
        type: String,
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
        default: null,
      },
      time: {
        type: Date,
        default: Date.now,
      },
      deadline: {
        type: Date,
        default: null
      },
    },
  ],
});

const Order = mongoose.model("Order", OrderSchema);


//TODO:
/**
 * Lưu thêm vào database:
 * zp_trans_id: string,
 * mac: string
 * 
 * để hoàn tiền nếu cần
 */

export default Order;
