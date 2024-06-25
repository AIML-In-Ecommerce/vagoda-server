import mongoose from "mongoose";
import { OrderStatus, PaymentMethod } from "./shared/enums.js";

const Schema = mongoose.Schema;

const CoordinateOrderSchema = new Schema({
  lng: {type: Number},
  lat: {type: Number}
})

const ColorInProductInOrderSchema = new Schema({
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


//create discriminator
//ref: https://mongoosejs.com/docs/discriminators.html#embedded-discriminators-in-arrays --> Single nested discriminator
const CODPaymentSchema = new Schema({
  name: {type: String, enum: Object.values(PaymentMethod), required: true},
  isPaid: {type: Boolean, required: true, default: false},
  paidAt: {type: Date, default: null}
}, {_id: false})

const ZaloPayPaymentSchema = new Schema({
  name: {type: String, enum: Object.values(PaymentMethod), required: true},
  zpTransId: {type: Number, default: null},
  zpUserId: {type: String, default: null},
  appTransId: {type: String, default: null},
  isPaid: {type: Boolean, required: true, default: false},
  paidAt: {type: Date, default: null}
}, {_id: false})

const PaymentMethodSchema = new Schema({
}, {discriminatorKey: "kind", _id: false})

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
      color: {
        type: ColorInProductInOrderSchema,
        default: null
      },
      size: {
        type: String,
        default: null
      }
    },
  ],
  promotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Promotion",
    default: null
  },
  paymentMethod: {
    type: PaymentMethodSchema,
    required: true,
    default: () => ({})
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
        type: CoordinateOrderSchema,
        default: null,
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


OrderSchema.path("paymentMethod").discriminator(PaymentMethod.COD, CODPaymentSchema)
OrderSchema.path("paymentMethod").discriminator(PaymentMethod.ZALOPAY, ZaloPayPaymentSchema)


const Order = mongoose.model("Order", OrderSchema);

export default Order;
