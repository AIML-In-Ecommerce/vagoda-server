import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CoordinateSchema = new Schema({
  lng: {type: Number, required: true},
  lat: {type: Number, required: true}
})

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?t=st=1716287350~exp=1716290950~hmac=4f6c0719e53c6f1ae903bdb234daa68509ee93c096aeb1d81ae4dc8c645fb893&w=740"
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  address: [
    {
      street: {type: String, required: true},
      idProvince: {type: String, required: true},
      idDistrict: {type: String, required: true},
      idCommune: {type: String, required: true},
      country: {type: String, required: true, default: "Việt Nam"},
      receiverName: {type: String, default: ""},
      phoneNumber: {type: String, required: true},
      coordinate: {
        type: CoordinateSchema,
        default: null,
      },
      label: {
        type: String,
        enum: ["HOME", "OFFICE"],
        default: "HOME"
      },
      isDefault: {
        type: Boolean,
        default: false
      },
    }
  ],
  account: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

export default User;
