import createError from "http-errors";
import UserService from "../services/user.service.js";
import AccountService from "../services/account.service.js";
import { AccountRegisterType } from "../shared/enums.js";
const model = "user";
const Model = "User";


const SystemUserController = {
  register: async (req, res, next) => {
    try {
      const {email, password, fullName, accountType} = req.body

      const objectData = 
      {
        email: email,
        password: password,
        accountType: accountType,
        registerType: AccountRegisterType.STANDARD
      }

      //ensure unique email for each account
      const existedAccount = await AccountService.getByEmail(email)
      if(existedAccount != null)
      {
        return next(createError.Conflict("Conflict when creating account"))
      }

      const newAccountId = await AccountService.create(objectData)

      const userData = {
        fullName: fullName,
        account: newAccountId,
      }
      const newUserId = await UserService.create(userData);

      console.log("register user and account successfully")
      res.json({
        message: "Create " + model + " successfully",
          data: {accountId: newAccountId, userId: newUserId},
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await UserService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getById: async (req, res, next) => {
    try {

      const id = req.params.id
      
      const object = await UserService.getById(id);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get " + model + " successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await UserService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create " + model + " successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const id = req.params.id;
      const object = await UserService.update(id, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await UserService.delete(id);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }

      console.log("Deteled " + id)
      res.json({
        message: "Delete" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  
  /**
   * req.body = 
    {
      street: {type: String, required: true},
      idProvince: {type: String, required: true},
      idDistrict: {type: String, required: true},
      idCommune: {type: String, required: true},
      country: {type: String, required: true, default: "Việt Nam"},
      receiverName: {type: String, default: ""},
      phoneNumber: {type: String, required: true},
      coordinate: {
        lng: {type: Number},
        lat: {type: Number},
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
   */
  insertShippingAddress: async (req, res, next) =>
  {
    try
    {
      const newShippingAddressObject = req.body
      const userId = req.query.userId

      if(!newShippingAddressObject || !userId)
      {
        return next(createError.BadRequest("Bad request to User service"))
      }
      else if(newShippingAddressObject.receiverName === undefined
        || newShippingAddressObject.phoneNumber === undefined || newShippingAddressObject.coordinate === undefined
        || newShippingAddressObject.label === undefined || newShippingAddressObject.isDefault === undefined)
      {
        return next(createError.BadRequest("Bad request to User service"))
      }

      //check the userId in accessToken and userId from req.params

      const shippingAddress = await UserService.insertShippingAddress(userId, newShippingAddressObject)
      if(shippingAddress == null)
      {
        return next(createError.MethodNotAllowed("Cannot insert the new shipping address"))
      }

      return res.json(
        {
          message: "Insert shipping address successfully",
          data: shippingAddress
        }
      )

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }

  },

  getShippingAddress: async (req, res, next) =>
  {
    try
    {
      const userId = req.query.userId

      //check userId in accessToken and the above userId

      const shippingAddress = await UserService.getShippingAddress(userId)
      if(shippingAddress == null)
      {
        return next(createError.NotFound("No shipping address found"))
      }

      return res.json(
        {
          message: "Get shipping address successfully",
          data: shippingAddress
        }
      )

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  /**
   * 
   * @param {*} userId: string 
   * @param {
      street: {type: String, required: true},
      idProvince: {type: String, required: true},
      idDistrict: {type: String, required: true},
      idCommune: {type: String, required: true},
      country: {type: String, required: true, default: "Việt Nam"},
      receiverName: {type: String, default: ""},
      phoneNumber: {type: String, required: true},
      coordinate: {
        lng: {type: Number},
        lat: {type: Number},
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
      } newShippingAddress 
    */
  updateShippingAddress: async (req, res, next) =>
  {
    try
    {
      const userId = req.query.userId
      const documentId = req.query.targetId
      const newShippingAddress = req.body

      if(userId == undefined || documentId == undefined || newShippingAddress == undefined)
      {
        return next(createError.BadRequest("Bad request to user service"))
      }

      //check userId later

      const shippingAddress = await UserService.updateShippingAddress(userId, documentId, newShippingAddress)
      if(shippingAddress == null)
      {
        return next(createError.MethodNotAllowed("Cannot update shipping address document"))
      }

      return res.json(
        {
          message: "Update shipping address successfully",
          data: shippingAddress
        }
      )
    }
    catch(error)
    {
      console.log(error)

      return next(createError.InternalServerError(error.message))
    }

  },

  deleteShippingAddress: async(req, res, next) =>
  {
    try
    {
      const userId = req.query.userId
      const documentId = req.query.targetId

      if(userId == null || documentId == null)
      {
        return next(createError.BadRequest("Bad request to user service"))
      }

      const shippingAddress = await UserService.deleteShippingAddress(userId, documentId)
      if(shippingAddress == null)
      {
        return next(createError.MethodNotAllowed("Cannot delete the document"))
      }

      return res.json(
        {
          message: "Delete shipping address successfully",
          data: shippingAddress
        }
      )
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  getUserInfo: async (req, res, next) =>
  {
    try {

      let object = null
      const userId = req.query.userId
      const accountId = req.query.accountId
      const useAddress = req.query.useAddress == "true"
      
      if(userId != undefined)
      {
        object = await UserService.getById(userId, useAddress)
      }
      else if(accountId != undefined)
      {
        object = await UserService.getByAccountId(accountId, useAddress)
      }
      else
      {
        return next(createError.BadRequest("Missing parameters"))
      }

      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get " + model + " successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getListOfUserInfos: async (req, res, next) =>
  {
    try
    {
      const userIds = req.body.userIds
      const useAddress = req.body.useAddress == "true"

      const userInfos = await UserService.getListOfUserInfos(userIds, useAddress)
      if(userInfos == null)
      {
        return next(createError.BadRequest("Cannot get the list of user infos"))
      }

      return res.json(
        {
          message: "Get list of user infos successfully",
          data: userInfos
        }
      )
    }
    catch(error)
    {
      return next(createError.InternalServerError(error.message))
    }
  }

};

export default SystemUserController;
