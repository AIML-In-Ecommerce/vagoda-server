import Shop from "./shop.model.js";
import axios from "axios";
const ShopService = {
  async getAll(filter, projection) {
    return await Shop.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id, useShopDetail, useDesign) {
    const rawShopInfo = await Shop.findById(id);
    if (rawShopInfo == null) {
      return null;
    }

    const finalResult = JSON.parse(JSON.stringify(rawShopInfo));

    if (useShopDetail == false) {
      finalResult.shopDetail = undefined;
    }

    if (useDesign == false) {
      finalResult.design = undefined;
      finalResult.shopInfoDesign = undefined;
    }

    return finalResult;
  },

  async getByIds(listOfIds, useShopDetail, useDesign) {
    const rawShopInfos = await Shop.find({ _id: { $in: listOfIds } });
    if (rawShopInfos == null) {
      return null;
    }

    const finalResult = rawShopInfos.map((item) => {
      const infoObject = JSON.parse(JSON.stringify(item));

      if (useShopDetail == false) {
        infoObject.shopDetail = undefined;
      }

      if (useDesign == false) {
        infoObject.design = undefined;
        infoObject.shopInfoDesign = undefined;
      }

      return infoObject;
    });

    return finalResult;
  },

  async create(objectData) {
    const newObject = new Shop(objectData);
    const newShopInfo = await newObject.save();
    return newShopInfo._id.toString();
  },

  async update(id, updateData) {
    return await Shop.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Shop.findByIdAndDelete(id);
  },

  async getByAccountId(id, useShopDetail, useDesign) {
    const rawShopInfo = await Shop.findOne({ account: id });
    if (rawShopInfo == null) {
      return null;
    }

    const finalResult = JSON.parse(JSON.stringify(rawShopInfo));

    if (useShopDetail == false) {
      finalResult.shopDetail = undefined;
    }

    if (useDesign == false) {
      finalResult.design = undefined;
      finalResult.shopInfoDesign = undefined;
    }

    return finalResult;
  },
  async addImageLinks(shopId, imageLinks) {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    const uniqueLinks = imageLinks.filter(
      (link) => !shop.imageCollection.includes(link)
    );
    shop.imageCollection.push(...uniqueLinks);

    await shop.save();
    return shop.imageCollection;
  },

  async removeImageLinks(shopId, imageLinks) {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    shop.imageCollection = shop.imageCollection.filter(
      (link) => !imageLinks.includes(link)
    );
    await shop.save();
    return shop.imageCollection;
  },
  async useDesign(shop, design) {
    console.log(design);
    //formatted design without _id and __v
    console.log("formattedDesign");
    const formattedDesign = design.map((widget) => {
      const { _id, __v, ...rest } = widget;
      return rest;
    });
    //console.log(formattedDesign);
    console.log("templates");
    const templates = await axios.get("http://14.225.218.109:3010/templates");
    console.log("templates");
    console.log(templates.data.data);
    //console.log(jsonDesign);
    //create new widgets from formatted design
    const response = await axios.post(
      "http://14.225.218.109:3010/widget/insertBatch",
      {
        widgets: formattedDesign,
      }
    );
    console.log("response");
    console.log(response.data);
    const widgets = response.data.data;
    const widgetIds = widgets.map((widget) => widget._id);

    console.log("dfsfsd");
    //update shop design
    const updatedShop = await ShopService.update(shop, {
      design: widgetIds,
    });
    console.log("updatedShop");
    console.log(updatedShop);
    return updatedShop;
  },
};

export default ShopService;
