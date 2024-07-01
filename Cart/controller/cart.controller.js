import createError from "http-errors";
import { AuthorizedUserIdInHeader } from "../services/verification.service.js";
import CartService from "../services/cart.service.js";
const model = "cart";
const Model = "Cart";


const CartController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await CartService.getAll(filter, "");
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
      const { id } = req.params;
      const object = await CartService.getById(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get" + model + "successfully",
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
      const object = await CartService.create(data);
      if (object == null) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create " + model + " successfully",
        data: object,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const object = await CartService.update(id, data);
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
      const object = await CartService.delete(id);
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

  getCartByUserId: async (req, res, next) =>
    {
      try
      {
        // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
        const userId = req.query.userId
  
        //check userId in accessToken and userId in req.params.id
        //if khac nhau ==> next(createError.Forbidden)
  
        const cart = await CartService.getByUserId(userId)
  
        if(cart == null)
        {
          return next(createError.NotFound("Cart not found"))
        }
  
        return res.json(
          {
            message: "Get cart successully",
            data: cart,
          }
        )
      }
      catch(error)
      {
        return next(createError.InternalServerError(error.message))
      }
    },


  /**
   * req.body = 
   * {
   *  products:
   *  [
   *    productId: string,
   *    quantity: number
   *  ]
   * }
   */
  updateProducts: async (req, res, next) =>
  {
    try
    {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId
      
      const requestBody = req.body
  
      if(requestBody == undefined || userId == undefined)
      {
        return next(createError.BadRequest("Bad request to cart service"))
      }
  
      //check userId in accessToken and userId in req.params.id
      //if khac nhau ==> next(createError.Forbidden)
  
      const result = await CartService.updateProducts(userId, requestBody.products)
      if(result == null)
      {
        return next(createError.MethodNotAllowed("Cannot update items in cart"))
      }

      const productInfos = (await CartService.getByUserId(userId)).products

      return res.json({
        message: "Update items in cart successfully",
        data: productInfos
      })
      
    }
    catch(error)
    {
      console.log(error)

      return next(createError.InternalServerError(error.message))
    }
  },

  async clearCart(req, res, next)
  {
    try
    {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId
  
      if(userId == undefined)
      {
        return next(createError.BadRequest("Bad request to cart service"))
      }
  
      //check userId in accessToken and userId in req.params.id
      //if khac nhau ==> next(createError.Forbidden)
  
      const result = await CartService.clearCartByUserId(userId)

      if(result != null)
      {
        return res.json(
          {
            message: "Clear cart successfully",
            data: result
          }
        )
      }
      else
      {
        return next(createError.MethodNotAllowed("Cannot clear the cart"))
      }
      
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async addToCart(req, res, next)
  {
    try
    {
      const userId = req.query.userId

      if(userId == undefined)
      {
        return next(createError.Unauthorized("User not found"))
      }

      const products = req.body.products

      const updatedProducts = await CartService.addToCart(userId, products)
      if(updatedProducts == null)
      {
        return next(createError.MethodNotAllowed("Cannot add products to cart"))
      }

      const productInfos = (await CartService.getByUserId(userId)).products

      return res.json({
        message: "Add products to cart successfully",
        data: productInfos
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

};

export default CartController;
