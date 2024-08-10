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

      //find older refresh-token record if it exist
      const olderRefreshTokenRecord = await RefreshTokenModel.findOne({user: buyerInfo._id, usedAt: {$eq: null}},  {}, {sort: {"createAt": -1}})
      if(olderRefreshTokenRecord != null)
      {
        olderRefreshTokenRecord.usedAt = new Date()
        await olderRefreshTokenRecord.save()
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

    //find older refresh-token record if it exist
    const olderRefreshTokenRecord = await RefreshTokenModel.findOne({user: sellerInfo._id, usedAt: {$eq: null}},  {}, {sort: {"createAt": -1}})
    if(olderRefreshTokenRecord != null)
    {
      olderRefreshTokenRecord.usedAt = new Date()
      await olderRefreshTokenRecord.save()
    }

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

    const refreshTokenRecord = await RefreshTokenModel.findOne({user: decodedPayload.userId, usedAt: {$eq: null}}, {}, {sort: {"createAt": -1}})
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
    // const record = await newRefreshTokenRecord.save()
    await newRefreshTokenRecord.save()

    const finalResult = 
    {
      userId: decodedPayload.userId,
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

  async generateSessionId(appTime, clientFingerprint)
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
      clientFingerprint: clientFingerprint,
      serverFingerprint: userRandomUUID,
      appTime: appTimeToExec
    }

    const stringifiedData = JSON.stringify(data)

    const generatedSessionId = CryptoJs.AES.encrypt(stringifiedData, process.env.SESS_SECRET_KEY, CryptoJs.enc.Utf8)

    return {
      uuid: userRandomUUID,
      data: data,
      sessionId: `${generatedSessionId}`
    }
  },

  async setSessionIdIntoCache(providedSessionId, data)
  {
    const stringifiedData = JSON.stringify(data)
    const cacheKey = `${sessionIdStoragePrefix}{${providedSessionId}}`
    await redisClient.set(cacheKey, stringifiedData, {
      EX: EXPIRY_TIME_OF_CACHE_SESSION_ID
    })
  },

  extractDataFromSessionId(sessionId)
  {
    try
    {
      const decryptedPayload = CryptoJs.AES.decrypt(sessionId, process.env.SESS_SECRET_KEY)
      const decodedPayload = decryptedPayload.toString(CryptoJs.enc.Utf8)
      return JSON.parse(decodedPayload)
    }
    catch(error)
    {
      return null
    }
  },

  async verifySessionId(providedSessionId)
  {
    const cacheKey = `${sessionIdStoragePrefix}{${providedSessionId}}`

    const stringifiedData = await redisClient.get(cacheKey)
    if(stringifiedData == null)
    {
      return null
    }

    const parsedData = JSON.parse(stringifiedData)

    const extractedData = this.extractDataFromSessionId(providedSessionId)
    if(extractedData == null)
    {
      return null
    }
    
    if((parsedData.clientFingerprint != extractedData.clientFingerprint) || (parsedData.serverFingerprint != extractedData.serverFingerprint))
    {
      return null
    }

    return {
      uuid: extractedData.clientFingerprint
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
