import createError from "http-errors";
import dotenv from "dotenv";
import AuthService from "./auth.service.js";
dotenv.config();

const AuthController = {
  // register: async (req, res, next) => {
  //   try {
  //     let { fullName, shopName, email, password, accountType} = req.body;
  //     if(req.body == undefined)
  //     {
  //       return next(createError.BadRequest("Missing request body"))
  //     }
  //     if(fullName == undefined) {
  //       return next(createError.BadRequest("Missing full name"))
  //     }
  //     if(shopName == undefined && accountType == "SHOP") {
  //       return next(createError.BadGateway("Missing shop name"))
  //     }

  //     const userServiceResponse = await UserService.registerAccountAndUserInfo({
  //       email: email,
  //       password: password,
  //       fullName: fullName,
  //       accountType: accountType
  //     })

  //     if(userServiceResponse == null)
  //     {
  //       return next(createError.MethodNotAllowed("Cannot create a new account"))
  //     }

  //     const newAccountId = userServiceResponse.accountId
  //     const newUserInfoId = userServiceResponse.userId
  //     console.log("account: "+ newAccountId)
  //     console.log("user: "+ newUserInfoId)

  //     if(accountType == "SHOP")
  //     {
  //       const newShopId = await ShopService.createShopInfo(shopName, newAccountId)
  //       if(newShopId == null)
  //       {
  //         await UserService.deleteUserInfo(newUserInfoId)
  //         await AccountService.deleteAccount(newAccountId)

  //         return next(createError.MethodNotAllowed("Your register was failed"))
  //       }

  //       return res.json(
  //         {
  //           message: "Register successfully",
  //           data: {
  //             accountId: newAccountId,
  //             shopId: newShopId
  //           }
  //         }
  //       )
  //     }
      
  //     res.json({
  //       message:  "Register successfully",
  //       data: {
  //         accountId: newAccountId,
  //         userId: newUserInfoId
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error)
  //     next(createError.InternalServerError(error.message));
  //   }
  // },

  registerSeller: async (req, res, next) =>
  {
    try
    {
      const {shopName, fullName, email, password} = req.body
      if(req.body == undefined)
      {
        return next(createError.BadRequest("Missing request body"))
      }
      else if(fullName == undefined) {
        return next(createError.BadRequest("Missing full name"))
      }
      else if(shopName == undefined) {
        return next(createError.BadGateway("Missing shop name"))
      }
      else if(email == undefined || password == undefined)
      {
        return next(createError.BadRequest("Missing necessary credentials"))
      }

      const hashedPassword = await AuthService.hashPassword(password)

      const registerData = 
      {
        email: email,
        password: hashedPassword,
        shopName: shopName,
        fullName: fullName
      }
      const response = await AuthService.registerSellerAccount(registerData)
      if(response == null)
      {
        return next(createError.BadRequest("Cannot create the new account"))
      }

      return res.json(
        {
          message: "Create seller account successfully",
          data: {
            shopId: response.shopId,
            accountId: response.accountId
          }
        }
      )

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  registerBuyer: async (req, res, next) =>
  {
    try
    {
      const {fullName, email, password} = req.body
      if(req.body == undefined)
      {
        return next(createError.BadRequest("Missing request body"))
      }
      else if(fullName == undefined) {
        return next(createError.BadRequest("Missing full name"))
      }
      else if(email == undefined || password == undefined)
      {
        return next(createError.BadRequest("Missing necessary credentials"))
      }

      const hashedPassword = await AuthService.hashPassword(password)

      const registerData = 
      {
        email: email,
        password: hashedPassword,
        fullName: fullName
      }
      const response = await AuthService.registerBuyerAccount(registerData)
      if(response == null)
      {
        return next(createError.BadRequest("Cannot create the new account"))
      }

      return res.json(
        {
          message: "Create buyer account successfully",
          data: {
            userId: response.userId,
            accountId: response.accountId
          }
        }
      )

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  loginByBuyer: async (req, res, next) =>
  {
    try
    {
      if(req.body == undefined)
      {
        return next(createError.BadRequest("Bad request to auth service"))
      }
      const {email, password} = req.body

      if(email == undefined || password == undefined)
      {
        return next(createError.BadRequest("Missing credentials"))
      }

      const response = await AuthService.loginByBuyer(email, password)
      if(response == null)
      {
        return next(createError.Unauthorized("Unauthorized"))
      }


      return res.json(response)
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  loginBySeller: async (req, res, next) =>
  {
    try
    {
      if(req.body == undefined)
      {
        return next(createError.BadRequest("Bad request to auth service"))
      }
      const {email, password} = req.body

      if(email == undefined || password == undefined)
      {
        return next(createError.BadRequest("Missing credentials"))
      }

      const response = await AuthService.loginBySeller(email, password)
      if(response == null)
      {
        return next(createError.Unauthorized("Unauthorized"))
      }


      return res.json(response)
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },


};

export default AuthController;
