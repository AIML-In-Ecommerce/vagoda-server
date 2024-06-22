import mongoose from "mongoose";

const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expireAt: {
    type: Date,
    required: true
  },
  usedAt: {
    type: Date,
    default: null
  }
});

const RefreshTokenModel = mongoose.model("RefreshToken", RefreshTokenSchema);

export function generateRefreshTokenModelProps(userId, hashedRefreshToken, expireAt)
{
  const recordProps = 
  {
    user: userId,
    refreshToken: hashedRefreshToken,
    expireAt: expireAt
  }

  return recordProps
}

export default RefreshTokenModel;
