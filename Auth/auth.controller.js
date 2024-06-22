import createError from "http-errors";
import dotenv from "dotenv";
import AuthService from "./auth.service.js";
import AccountService from "./support/account.service.js";
import { AccountType } from "./shared/enums.js";
dotenv.config();

const SESSION_ID_COOKIE_KEY = String(process.env.SESSION_COOKIE_KEY) || "ssid"

const AuthController = {

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

      const existedAccount = await AccountService.getAccountByEmail(email)
      if(existedAccount != null)
      {
        return next(createError.Conflict("Email conflict"))
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

      const existedAccount = await AccountService.getAccountByEmail(email)
      if(existedAccount != null)
      {
        return next(createError.Conflict("Email conflict"))
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
      

      res.json({
        message: "Login successfully",
        data: response
      })
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


      res.json({
        message: "Login successfully",
        data: response
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  

  register: async (req, res, next) =>
  {
    const type = req.body.type
    if(type == AccountType.BUYER)
    {
      return await AuthController.registerBuyer(req, res, next)
    }
    else if(type == AccountType.SHOP)
    {
      return await AuthController.registerSeller(req, res, next)
    }
    else
    {
      return next(createError.BadRequest("Type not found"))
    }
  },

  login: async (req, res, next) =>
  {
    const type = req.body.type
    if(type == AccountType.SHOP)
    {
      return await AuthController.loginBySeller(req, res, next)
    }
    else if(type == AccountType.BUYER)
    {
      return await AuthController.loginByBuyer(req, res, next)
    }
    else
    {
      return next(createError.BadRequest("Type not found"))
    }
  },

  refreshToken: async (req, res, next) =>
  {
    try
    {
      const refreshToken = req.body.refreshToken

      const response = await AuthService.refreshToken(refreshToken)
      if(response == null)
      {
        return next(createError.MethodNotAllowed("Cannot refresh the new token"))
      }

      return res.json({
        message: "Refresh token successfully",
        data: response
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  verifyAccessToken: async (req, res, next) =>
  {
    try
    {
      const providedAccessToken = req.body.accessToken
      const sentTime = req.body.sentTime

      const info = await AuthService.verifyAccessToken(providedAccessToken, sentTime)
      if(info == null)
      {
        return next(createError.Unauthorized("Invalid access token"))
      }

      return res.json(
        {
          message: "Valid token",
          data: info
        }
      )
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async getSessionId(req, res, next)
  {
    try
    {
      const appTime = req.query.appTime

      const sessionData = await AuthService.generateSessionId(appTime)

      //store session id in Redis
      await AuthService.setSessionIdIntoCache(sessionData.uuid, sessionData.data)

      //set to cookie
      res.cookie(SESSION_ID_COOKIE_KEY, sessionData.sessionId)

      return res.json({
        message: "Get session id sucessfully",
        data: sessionData.sessionId
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async removeSession(req, res, next)
  {
    try
    {
      const sessionId = req.cookies[`${sessionIdCookieKey}`]
      console.log(sessionId)
      if(sessionId == undefined)
      {
        return next(createError.MethodNotAllowed("Cannot remove session id"))
      }
      await AuthService.removeSessionFromCache(sessionId)

      res.clearCookie(SESSION_ID_COOKIE_KEY)

      return res.json(
        {
          message: "Remove session cookie successfully",
          data: {}
        }
      )
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async verifySessionId(req, res, next)
  {
    try
    {
      const sessionId = req.body.sessionId
      const verifiedData = await AuthService.verifySessionId(sessionId)
      if(verifiedData == null)
      {
        return next(createError.Unauthorized("Invalid sessionId value"))
      }

      return res.json({
        message: "Valid sessionId value",
        data: verifiedData
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async logout(req, res, next)
  {
    try
    {


    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

};

export default AuthController;
