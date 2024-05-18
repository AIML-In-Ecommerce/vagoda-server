import createError from "http-errors";
import CartService from "./cart.service.js"
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
      const userId = req.params.id

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
      const userId = req.params.id
      const requestBody = req.body
  
      if(requestBody == undefined || userId == undefined)
      {
        return next(createError.BadRequest("Bad request to cart service"))
      }
  
      //check userId in accessToken and userId in req.params.id
      //if khac nhau ==> next(createError.Forbidden)
  
      const result = await CartService.updateProducts(userId, requestBody.products)

      if(result != null)
      {
        return res.json(
          {
            message: "Update cart successfully",
            data: result
          }
        )
      }
      else
      {
        return next(createError.MethodNotAllowed("Cannot update the document"))
      }
      
    }
    catch(error)
    {
      console.log(error)

      return next(createError.InternalServerError(error.message))
    }
  }

};

export default CartController;
