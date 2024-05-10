import createError from "http-errors";
import axios from "axios";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "./utils/jwt.js";
dotenv.config();

const AuthController = {
  register: async (req, res, next) => {
    try {
      const { fullName, shopName, email, password, accountType} = req.body;

      const accountResponse = await axios.post("http://14.225.218.109:3002/user/register", {
        fullName,
        shopName,
        email,
        password,
      });
      console.log(accountResponse)
      const data = accountResponse.data;
      if(accountType === "SHOP"){
        const shopResponse = await axios.post("http://14.225.218.109:3002/shop",{
        shopName,
        account: accountResponse.data._id,
      });
      }
      
      // Trả về kết quả từ /account/register
      res.json({
        message:  "Register successfully",
        status: 200,
        data: data,
      });
    } catch (error) {
      console.log(error)
      next(createError.InternalServerError(error.message));
    }
  },

  login: async (req, res, next) => {
    try {
      // Lấy thông tin đăng nhập từ request body
      const { email, password } = req.body;
      
      // Gọi HTTP tới /account/login để xác thực đăng nhập
      const account = await axios.post("http://localhost:3002/account/login", {
        email,
        password,
      });
      console.log("thien")
      if(!account) {
        return next(createError.BadRequest("Email or password was wrong!"));
      }

      const accessToken = generateAccessToken(account._id, account.accountType)
      const { refreshToken, expireDate } = generateRefreshToken(
        account._id,
        account.accountType
      );
      
      // Trả về kết quả từ /account/login
      res.json({
        message: "Login successfully",
        status: 200,
        data: {accessToken, refreshToken},
      });
    } catch (error) {
      // console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
};

export default AuthController;
