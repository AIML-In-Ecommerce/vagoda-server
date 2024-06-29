import createError from "http-errors";
import ShopService from "../shop.service.js";

const model = "shop";
const Model = "Shop";
const ShopController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await ShopService.getAll(filter, "");
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

  
  getShopByIdList: async (req, res, next) =>
  {
    try
    {
      const requestBody = req.body
      const shopIds = requestBody.ids
      const useDesign = requestBody.useDesign
      const useShopDetail = requestBody.useShopDetail

      const listOfShops = await ShopService.getByIds(shopIds, useShopDetail, useDesign)

      if(!listOfShops)
      {
        return next(createError.BadRequest(Model + " list not found"));
      }

      res.json(
        {
          message: "Get list of shops successfully",
          data: listOfShops
        });
      } catch (error) {
        next(createError.InternalServerError(error.message));
      }
    },

    
    getShopByIdList: async (req, res, next) =>
    {
      try
      {
        const requestBody = req.body
        const shopIds = requestBody.ids
        const useDesign = requestBody.useDesign
        const useShopDetail = requestBody.useShopDetail

        const listOfShops = await ShopService.getByIds(shopIds, useShopDetail, useDesign)

        if(!listOfShops)
        {
          return next(createError.BadRequest(Model + " list not found"));
        }

        res.json(
          {
            message: "Get list of shops successfully",
            data: listOfShops
          }
        )
      }
      catch(err)
      {
        return next(createError.InternalServerError(err.message))
      }
    },

    getById: async (req, res, next) => {
      try {

        const id = req.params.id

        const object = await ShopService.getById(id);
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
        const newShopId = await ShopService.create(data);
        if (!newShopId) {
          return next(createError.BadRequest("Bad request!"));
        }
        res.json({
          message: "Create " + model + " successfully",
          status: 200,
          data: newShopId,
        });
      } catch (error) {
        next(createError.InternalServerError(error.message));
      }
    },
    update: async (req, res, next) => {
      try {
        const data = req.body;
        const { id } = req.params;
        const object = await ShopService.update(id, data);
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
        const object = await ShopService.delete(id);
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

    getByAccountId: async(req, res, next) =>
    {
      try
      {
        const accountId = req.query.accountId
        const useDesign = req.query.useDesign == "true"
        const useShopDetail = req.query.useShopDetail == "true"
        
        const shopInfo = await ShopService.getByAccountId(accountId, useShopDetail, useDesign)
        if(shopInfo == null)
        {
          return next(createError.NotFound("Shop info not found"))
        }

        return res.json({
          message: "Get shop info successfully",
          data: shopInfo
        })
      }
      catch(error)
      {
        console.log(error)
        return next(createError.InternalServerError(error.message))
      }
    },

    getShopBySelection: async (req, res, next) => {
      try {

        const shopId = req.query.shopId
        const accountId = req.query.accountId
        const useDesign = req.query.useDesign == "true"
        const useShopDetail = req.query.useShopDetail == "true"

        let object = null
        if(shopId != undefined)
        {
          object = await ShopService.getById(shopId, useShopDetail, useDesign)
        }
        else if(accountId != undefined)
        {
          object = await ShopService.getByAccountId(accountId, useShopDetail, useDesign)
        }

        if (object == null) 
        {
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
    addImageLinks: async (req, res, next) => {
      try {
        const { shop } = req.params;
        const { imageUrls } = req.body;

        if (!Array.isArray(imageUrls)) {
          return next(createError.BadRequest("Image URLs must be an array of strings"));
        }
    
        for (let url of imageUrls) {
          if (typeof url !== "string") {
            return next(createError.BadRequest("Each image URL must be a string"));
          }
        }
  
        const updatedImageCollection = await ShopService.addImageLinks(shop, imageUrls);
  
        res.json({
          message: "Add image urls to shop successfully",
          status: 200,
          data: updatedImageCollection,
        });
      } catch (error) {
        next(createError.InternalServerError(error.message));
      }
    },
    removeImageLinks: async (req, res, next) => {
      try {
        const { shop } = req.params;
        let { imageUrls } = req.body;

        if (!Array.isArray(imageUrls)) {
          return next(createError.BadRequest("Image URLs must be an array of strings"));
        }

        for (let url of imageUrls) {
          if (typeof url !== "string") {
            return next(createError.BadRequest("Each image URL must be a string"));
          }
        }
  
        const updatedImageCollection = await ShopService.removeImageLinks(shop, imageUrls);
  
        res.json({
          message: "Remove image urls from shop successfully",
          status: 200,
          data: updatedImageCollection,
        });
      } catch (error) {
        next(createError.InternalServerError(error.message));
      }
    },

  };

  export default ShopController;
