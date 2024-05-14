import createError from "http-errors";
import UserService from "../services/user.service.js";
import AccountService from "../services/account.service.js";
const model = "user";
const Model = "User";
const UserController = {
  register: async (req, res, next) => {
    try {
      const {email, password, fullName, accountType} = req.body;
      const account = await AccountService.create({email, password, accountType});
      const userData = {
        fullName,
        account: account._id,
      }
      const object = await UserService.create(userData);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create" + model + "successfully",
        status: 200,
        data: object,
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
      const id = req.query.userId;
      const object = await UserService.getById(id);
      if (!object) {
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
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
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
   * {
   * 	"receiverName": "Lưu Hoàng Minh",
      "address": "227 Đ.Nguyễn Văn Cừ, phường 3, quận 5, TP Hồ Chí Minh",
      "phoneNumber": "0122446793",
      "coordinate": null | {lng: number, lat: number},
      "label": "OFFICE",
      "isDefault": false
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
      else if(newShippingAddressObject.receiverName === undefined || newShippingAddressObject.address === undefined
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
      console.log(userId)
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
    *  receiverName: string,
    *  address: string,
    *  phoneNumber: string,
    *  coordinate: 
    *  {
    *    lng: number,
    *    lat: number,
    *  },
    *  label: ["HOME", "OFFICE"],
    *  isDefault: boolean
    * } newShippingAddress 
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

  }

};

export default UserController;
