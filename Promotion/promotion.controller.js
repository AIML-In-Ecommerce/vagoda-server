import createError from "http-errors";
import PromotionService from "./promotion.service.js";
const model = "promotion";
const Model = "Promotion";
const PromotionController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await PromotionService.getAll(filter, "");
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

  getByIds: async (req, res, next) =>
  {
    try
    {
      const promotionIds = req.body.promotionIds

      const listOfPromotion = await PromotionService.getByIds(promotionIds)
      if(!listOfPromotion)
      {
        return next(createError.BadRequest(Model + " list not found"));
      }

      return res.json(
        {
          message: "Get list of promotions successfully",
          data: listOfPromotion,
        }
      )

    }
    catch(error)
    {

      next(createError.InternalServerError(error.message));
    }
  },

  getById: async (req, res, next) => {
    try {
      const promotionId = req.query.promotionId
      const object = await PromotionService.getById(promotionId);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get " + model + " successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    try {
      const shopId = req.query.shopId

      const data = req.body
      data.shop = shopId

      const object = await PromotionService.create(data);
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
      const shopId = req.query.shopId
      const promotionId = req.query.promotionId

      const data = req.body;

      const object = await PromotionService.update(promotionId, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update " + model + " successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const shopId = req.query.shopId
      const promotionId = req.query.promotionId

      const object = await PromotionService.delete(promotionId);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Delete " + model + " successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getByShopId: async (req, res, next) => {
    try {
      const shopId = req.query.shopId
      const list = await PromotionService.getByShopId(shopId);
      if (!list) {
        return next(createError.BadRequest("Shop id not found"));
      }
      res.json({
        message: "Get " + model + " list successfully",
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  async getPromotionBySelection(req, res, next)
  {
    try
    {
      const shopId = req.body.shopId
      const lowerBoundaryForOrder = req.body.lowerBoundaryForOrder
      const targetProducts = req.body.targetProducts
      const inActive = req.body.inActive

      const promotions = await PromotionService.getPromotionBySelectionFromBuyer(shopId, lowerBoundaryForOrder, targetProducts, inActive)
      if(promotions == null)
      {
        return next(createError.BadRequest("Missing parameters"))
      }

      return res.json({
        message: "Get promotions successfully",
        data: promotions
      })

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  async getPromotionsWithCodes(req, res, next)
  {
    try
    {
      const shopId = req.query.shopId

      const codes = req.body.codes

      const listOfPromotions = await PromotionService.getPromotionsByCodes(shopId, codes)
      if(listOfPromotions == null)
      {
        return next(createError.BadRequest())
      }

      return res.json(
        {
          message: "Get promotions by codes successfully",
          data: listOfPromotions
        }
      )
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

};

export default PromotionController;
