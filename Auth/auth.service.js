import bcrypt from 'bcryptjs'
import { AccountType } from './shared/enums.js'
import ShopService from './support/shop.service.js'
import AccountService from './support/account.service.js'
import UserService from './support/user.service.js'
import { generateAccessToken, generateRefreshToken } from './utils/jwt.js'

const SALT_ROUND = Number(process.env.SALT_ROUND)

const AuthService = {
  // async register(data) {
  //   return await data;
  // }
  // async getAll(filter, projection) {
  //   return await Shop.find(filter).select(projection);
  // },
  // // async getAll() {
  // //   return await AuthorizeRequest.find();
  // // },

  // async getById(id) {
  //   return await Shop.findById(id);
  // },

  // async create(objectData) {
  //   const newObject = new Shop(objectData);
  //   return await newObject.save();
  // },

  // async update(id, updateData) {
  //   return await Shop.findByIdAndUpdate(id, updateData, { new: true });
  // },

  // async delete(id) {
  //   return await Shop.findByIdAndDelete(id);
  // },

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

    const registerObject = 
    {
      fullName: requiredData.fullName,
      email: requiredData.email,
      password: requiredData.password,
      accountType: AccountType.SHOP
    }
    const userServiceResponse = await UserService.registerAccountAndUserInfo(registerObject)
    if(userServiceResponse == null)
    {
      return null
    }

    const newAccountId = userServiceResponse.accountId;
    const newUserId = userServiceResponse.userId;

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
    const {refreshToken, expiredDate} = generateRefreshToken(buyerInfo._id, buyerInfo.fullName, account.type)

    const finalResult = 
    {
      buyerInfo: buyerInfo,
      accessToken: accessToken,
      refreshToken: refreshToken,
      refreshTokenExpiredDate: expiredDate
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

    const accessToken = generateAccessToken(sellerInfo._id, sellerInfo.fullName, account.type)
    const {refreshToken, expiredDate} = generateRefreshToken(sellerInfo._id, sellerInfo.fullName, account.type)

    const finalResult = 
    {
      sellerInfo: sellerInfo,
      accessToken: accessToken,
      refreshToken: refreshToken,
      refreshTokenExpiredDate: expiredDate
    }

    return finalResult
  }

};

export default AuthService
