import bcrypt from 'bcryptjs'
import crypto from "crypto"
import CryptoJs from "crypto-js"
import { AccountType } from './shared/enums.js'
import ShopService from './support/shop.service.js'
import AccountService from './support/account.service.js'
import UserService from './support/user.service.js'
import { generateAccessToken, generateRefreshToken, verifyToken } from './utils/jwt.js'
import CartService from './support/cart.service.js'
import RefreshTokenModel, { generateRefreshTokenModelProps } from './refreshToken.model.js'
import redisClient from './configs/redis.config.js'


const SALT_ROUND = Number(process.env.SALT_ROUND)
const sessionIdStoragePrefix = "#auth-session-id-cache#"
const EXPIRY_TIME_OF_CACHE_SESSION_ID = 60*60*12

const AuthService = {

  async validatePassword(password, hashedPassword)
  {
    if(password == undefined)
    {
      return false
    }
    
    return await bcrypt.compare(password, hashedPassword)
  },

  async hashPassword(password)
  {
    const salt = await bcrypt.genSalt(SALT_ROUND)

    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  },

  /**
   * @param {
   *  fullName: string,
   *  email: string,
   *  password: string,
   * } requiredData
   * 
   * @returns {object} {accountId, userId}
   */
  async registerBuyerAccount(requiredData)
  {
    if(requiredData == undefined)
    {
      return null
    }
    else if(requiredData.fullName == undefined || requiredData.email == undefined || requiredData.password == undefined)
    {
      return null
    }

    const registerObject = 
    {
      email: requiredData.email,
      password: requiredData.password,
      fullName: requiredData.fullName,
      accountType: AccountType.BUYER
    }
    //call API to create a new Account
    const userServiceResponse = await UserService.registerAccountAndUserInfo(registerObject)
    if(userServiceResponse == null)
    {
      return null
    }

    //create cart
    const cartInfo = await CartService.createCart(userServiceResponse.userId)
    if(cartInfo == null)
    {
      await UserService.deleteUserInfo(userServiceResponse.userId)
      await AccountService.deleteAccount(userServiceResponse.accountId)
      return null
    }

    const finalResult = 
    {
      accountId: userServiceResponse.accountId,
      userId: userServiceResponse.userId
    }

    return finalResult
  },

  /**
  * @param requiredData
  * 
  *  fullName: string,
  *  shopName: string,
  *  email: string,
  *  password: string,
  * 
  */
  async registerSellerAccount(requiredData)
  {
    if(requiredData == undefined)
    {
      return null
    }
    else if(requiredData.fullName == undefined || requiredData.email == undefined || requiredData.password == undefined || requiredData.shopName == undefined)
    {
      return null
    }

    const userServiceResponse = await AccountService.createAccount(requiredData.email, requiredData.password, AccountType.SHOP)
    if(userServiceResponse == null)
    {
      return null
    }

    const newAccountId = userServiceResponse

    const newShopId = await ShopService.createShopInfo(requiredData.shopName, newAccountId)
    if(newShopId == null)
    {
      await UserService.deleteUserInfo(newUserId)
      await AccountService.deleteAccount(newAccountId)
      console.log("remove userInfo and accountInfo")
      return null;
    }

    const finalResult = 
    {
      accountId: newAccountId,
      shopId: newShopId
    }

    return finalResult
  },

  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {object}
   * {
   *  buyerInfo, accessToken, refreshToken, refreshTokenExpiredDate
   * }
   */
  async loginByBuyer(email, password)
  {
    const account = await AccountService.getAccountByEmail(email)
    if(account == null)
    {
      return null
    }

    if(account.type != AccountType.BUYER)
    {
      return null
    }

    const isCorrectPassword = await AuthService.validatePassword(password, account.password)
    if(isCorrectPassword == false)
    {
      return null
    }

    const accountId = account._id

    const buyerInfo = await UserService.getUserInfoByAccountId(accountId)
    if(buyerInfo == null)
    {
      return null
    }

    //generate access token and refresh token

    const accessToken = generateAccessToken(buyerInfo._id, buyerInfo.fullName, account.type)
    const refreshToken = generateRefreshToken(buyerInfo._id, buyerInfo.fullName, account.type)

    const hashedToken = await bcrypt.hash(refreshToken.refreshToken, SALT_ROUND)
    const newRefreshTokenRecordProps = generateRefreshTokenModelProps(buyerInfo._id, hashedToken, refreshToken.expiredDate)
    const newRefreshTokenRecord = new RefreshTokenModel(newRefreshTokenRecordProps)
    await newRefreshTokenRecord.save()

    const finalResult = 
    {
      buyerInfo: buyerInfo,
      accessTokenExpiredDate: accessToken.expiredDate,
      accessToken: accessToken.accessToken,
      refreshToken: refreshToken.refreshToken,
      refreshTokenExpiredDate: refreshToken.expiredDate
    }

    return finalResult
  },

  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {object}
   * {
   *  seller, accessToken, refreshToken, refreshTokenExpiredDate
   * }
   */
  async loginBySeller(email, password)
  {
    const account = await AccountService.getAccountByEmail(email)
    if(account == null)
    {
      return null
    }

    if(account.type != AccountType.SHOP)
    {
      return null
    }

    const isCorrectPassword = await AuthService.validatePassword(password, account.password)
    if(isCorrectPassword == false)
    {
      return null
    }

    const accountId = account._id

    const sellerInfo = await ShopService.getShopInfoByAccountId(accountId)
    if(sellerInfo == null)
    {
      return null
    }

    //generate access token and refresh token

    const accessToken = generateAccessToken(sellerInfo._id, sellerInfo.name, account.type)
    const refreshToken = generateRefreshToken(sellerInfo._id, sellerInfo.name, account.type)

    const hashedToken = await bcrypt.hash(refreshToken.refreshToken, SALT_ROUND)
    const newRefreshTokenRecordProps = generateRefreshTokenModelProps(sellerInfo._id, hashedToken, refreshToken.expiredDate)
    const newRefreshTokenRecord = new RefreshTokenModel(newRefreshTokenRecordProps)
    await newRefreshTokenRecord.save()

    const finalResult = 
    {
      sellerInfo: sellerInfo,
      accessTokenExpiredDate: accessToken.expiredDate,
      accessToken: accessToken.accessToken,
      refreshToken: refreshToken.refreshToken,
      refreshTokenExpiredDate: refreshToken.expiredDate
    }

    return finalResult
  },

  async refreshToken(refreshToken)
  {
    const currentDate = new Date()
    const currentDateTime = currentDate.getTime()

    if(refreshToken == undefined)
    {
      console.log("undefinded token")
      return null
    }

    const decodedPayload = verifyToken(refreshToken)
    const exp = new Date(decodedPayload.exp*1000).getTime()

    const refreshTokenRecord = await RefreshTokenModel.findOne({user: decodedPayload.userId}, {}, {sort: {"createAt": -1}})
    if(refreshTokenRecord == null)
    {
      console.log("Null token record")
      return null
    }

    refreshTokenRecord.usedAt = currentDate
    const upadatedRecord = await refreshTokenRecord.save()
    if(exp < currentDateTime)
    {
      console.log("overtime")
      return null
    }

    const isValidToken = await bcrypt.compare(refreshToken, upadatedRecord.refreshToken)

    if(isValidToken == false)
    {
      console.log("Invalid token")
      return null
    }

    // valid refresh token

    const newAccessTokenProps = generateAccessToken(decodedPayload.userId, decodedPayload.fullName, decodedPayload.userRole)
    const refreshTokenProps = generateRefreshToken(decodedPayload.userId, decodedPayload.fullName, decodedPayload.userRole)

    const hashedNewToken = await bcrypt.hash(refreshTokenProps.refreshToken, SALT_ROUND)

    const newRefreshTokenRecordProps = generateRefreshTokenModelProps(decodedPayload.userId, hashedNewToken, refreshTokenProps.expiredDate)
    const newRefreshTokenRecord = new RefreshTokenModel(newRefreshTokenRecordProps)
    await newRefreshTokenRecord.save()

    const finalResult = 
    {
      accessToken: newAccessTokenProps.accessToken,
      accessTokenExpiredDate: newAccessTokenProps.expiredDate,
      refreshToken: refreshTokenProps.refreshToken,
      refreshTokenExpiredDate: refreshTokenProps.expiredDate
    }

    return finalResult
  },


  async verifyAccessToken(providedAccessToken, sentTime)
  {
    try
    {
      const timeToCheck = new Date(sentTime).getTime()
      if(providedAccessToken == undefined)
      {
        return null
      }

      const decodedToken = verifyToken(providedAccessToken)

      if(decodedToken.exp == undefined)
      {
        return null
      }
      // const expiredDate = decodedToken.exp
      const expiredDate = decodedToken.exp*1000 //to milliseconds
      if(timeToCheck > expiredDate)
      {
        return null
      }

      const finalResult = 
      {
        userId: decodedToken.userId,
        fullname: decodedToken.fullname,
        userRole: decodedToken.userRole
      }

      return finalResult
    }
    catch(error)
    {
      console.log(error)
      return null
    }
  },

  async generateSessionId(appTime)
  {
    let appTimeToExec = new Date()
    if(appTime != undefined)
    {
      appTimeToExec = new Date(appTime)
    }
    const userRandomUUID = crypto.randomUUID()
    const nonce = crypto.randomUUID()

    const data = 
    {
      nonce: nonce,
      appTime: appTimeToExec
    }

    const stringifiedData = JSON.stringify(data)

    const mac = CryptoJs.HmacSHA256(stringifiedData, process.env.SESS_SECRET_KEY).toString();

    data.mac = mac

    return {

      uuid: userRandomUUID,
      data: data,
      sessionId: `${userRandomUUID}-${mac}`
    }
  },

  async setSessionIdIntoCache(providedUUID, data)
  {
    const stringifiedData = JSON.stringify(data)
    const cacheKey = `${sessionIdStoragePrefix}{${providedUUID}}`
    await redisClient.set(cacheKey, stringifiedData, {
      EX: EXPIRY_TIME_OF_CACHE_SESSION_ID
    })
  },

  extractUUIDandSessionIdFromSessionId(sessionId)
  {
    if(sessionId == undefined)
    {
      return null
    }
    if(sessionId.length == 0)
    {
      return null
    }

    const encodedTexts = sessionId.split("-")
    if(encodedTexts.length != 6)
    {
      return null
    }

    let uuid = encodedTexts[0] + "-" + encodedTexts[1] + "-" + encodedTexts[2] + "-" + encodedTexts[3] + "-" + encodedTexts[4]
    const mac = encodedTexts[5]

    return {
      uuid: uuid,
      mac: mac
    }
  },

  async verifySessionId(providedSessionId)
  {
    const extractedData = this.extractUUIDandSessionIdFromSessionId(providedSessionId)
    if(extractedData == null)
    {
      return null
    }
    const cacheKey = `${sessionIdStoragePrefix}{${extractedData.uuid}}`
    const stringifiedData = await redisClient.get(cacheKey)
    if(stringifiedData == null)
    {
      return null
    }

    const parsedData = JSON.parse(stringifiedData)
    if(parsedData.mac != extractedData.mac)
    {
      return null
    }

    return {
      uuid: extractedData.uuid,
      mac: extractedData.mac
    }
  },

  async removeSessionFromCache(providedSessionId)
  {
    const extractedData = this.extractUUIDandSessionIdFromSessionId(providedSessionId)
    if(extractedData == null)
    {
      return null
    }

    const cacheKey = `${sessionIdStoragePrefix}{${extractedData.uuid}}`
    await redisClient.del(cacheKey)
  }

};

export default AuthService
