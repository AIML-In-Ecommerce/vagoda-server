import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import crypto from 'crypto'

dotenv.config();
const secretKey = process.env.SECRET_KEY;


export const generateAccessToken = (userId, fullname, userRole) => 
{

  const nonce = crypto.randomUUID()
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY
  const payload = 
  {
    userId: userId,
    fullname: fullname,
    userRole: userRole,
    nonce: nonce
  }
  const accessToken = jwt.sign(payload, secretKey, {expiresIn: expiresIn});
  const decodedToken = jwt.decode(accessToken);
  const expiredDate = new Date(decodedToken.exp * 1000);
  return { accessToken, expiredDate };
};

export const generateRefreshToken = (userId, fullname, userRole) => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY
  
  const nonce = crypto.randomUUID()

  const payload = {
    userId: userId,
    fullname: fullname,
    userRole: userRole,
    nonce: nonce 
  };

  const refreshToken = jwt.sign(payload, secretKey, { expiresIn });
  const decodedToken = jwt.decode(refreshToken);
  const expiredDate = new Date(decodedToken.exp * 1000);
  return { refreshToken, expiredDate };
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    throw err;
  }
};
