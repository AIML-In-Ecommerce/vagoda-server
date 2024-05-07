import createError from "http-errors";
import axios from "axios";
import dotenv from "dotenv";
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
      const shopResponse = await axios.post("http://14.225.218.109:3002/shop",{
        shopName,
        account: accountResponse.data._id,
      });
      // Trả về kết quả từ /account/register
      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: accountResponse.data,
      });
    } catch (error) {
      console.log(error)
      next(createError.InternalServerError(error.message));
    }
  },

  login: async (req, res, next) => {
    try {
      // Lấy thông tin đăng nhập từ request body
      const { username, password } = req.body;

      // Gọi HTTP tới /account/login để xác thực đăng nhập
      const accountResponse = await axios.post("/account/login", {
        username,
        password,
      });

      // Trả về kết quả từ /account/login
      res.json(accountResponse.data);
    } catch (error) {
      // Xử lý lỗi nếu có
      next(createError.InternalServerError(error.message));
    }
  },
};

export default AuthController;
