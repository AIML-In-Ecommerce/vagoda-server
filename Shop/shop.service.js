import Shop from "./shop.model.js";
const ShopService = {
  async getAll(filter, projection) {
    return await Shop.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id, useShopDetail, useDesign) {
    const rawShopInfo = await Shop.findById(id);
    if(rawShopInfo == null)
    {
      return null
    }

    const finalResult = 
    {
      _id: rawShopInfo._id,
      name: rawShopInfo.name,
      location: rawShopInfo.location,
      description: rawShopInfo.description,
      createAt: rawShopInfo.createAt,
      __v: rawShopInfo.__v
    }

    if(useShopDetail == undefined)
    {
      finalResult.shopDetail = rawShopInfo.shopDetail
    }
    else if(useShopDetail == true)
    {
      finalResult.shopDetail = rawShopInfo.shopDetail
    }

    if(useDesign == undefined)
    {
      finalResult.design = rawShopInfo.design,
      finalResult.shopInfoDesign = rawShopInfo.shopInfoDesign
    }
    else if(useDesign == true)
    {
      finalResult.design = rawShopInfo.design,
      finalResult.shopInfoDesign = rawShopInfo.shopInfoDesign
    }
  
  
    return finalResult
  },

  async getByIds(listOfIds, useShopDetail, useDesign)
  {
    
    const rawShopInfos = await Shop.find({_id: {$in: listOfIds}})
    if(rawShopInfos == null)
    {
      return null
    }
    

    const finalResult = rawShopInfos.map((item) =>
    {
      const infoObject =
      {
        _id: item._id,
        name: item.name,
        location: item.location,
        description: item.description,
        createAt: item.createAt,
        __v: item.__v
      }

      if(useShopDetail == undefined)
      {
        infoObject.shopDetail = item.shopDetail
      }
      else if(useShopDetail == true)
      {
        infoObject.shopDetail = item.shopDetail
      }

      if(useDesign == undefined)
      {
        infoObject.design = item.design,
        infoObject.shopInfoDesign = item.shopInfoDesign
      }
      else if(useDesign == true)
      {
        infoObject.design = item.design,
        infoObject.shopInfoDesign = item.shopInfoDesign
      }

      return infoObject
    })


    return finalResult
  },

  async create(objectData) {
    const newObject = new Shop(objectData);
    const newShopInfo = await newObject.save();
    return newShopInfo._id.toString()
  },

  async update(id, updateData) {
    return await Shop.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Shop.findByIdAndDelete(id);
  },

  async getByAccountId(id, useShopDetail, useDesign)
  {
    const rawShopInfo = await Shop.findOne({account: id})
    if(rawShopInfo == null)
    {
      return null
    }

    const finalResult = 
    {
      _id: rawShopInfo._id,
      name: rawShopInfo.name,
      location: rawShopInfo.location,
      description: rawShopInfo.description,
      createAt: rawShopInfo.createAt,
      __v: rawShopInfo.__v
    }

    if(useShopDetail == undefined)
    {
      finalResult.shopDetail = rawShopInfo.shopDetail
    }
    else if(useShopDetail == true)
    {
      finalResult.shopDetail = rawShopInfo.shopDetail
    }

    if(useDesign == undefined)
    {
      finalResult.design = rawShopInfo.design,
      finalResult.shopInfoDesign = rawShopInfo.shopInfoDesign
    }
    else if(useDesign == true)
    {
      finalResult.design = rawShopInfo.design,
      finalResult.shopInfoDesign = rawShopInfo.shopInfoDesign
    }
  
  
    return finalResult
  },
  async addImageLinks(shopId, imageLinks) {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    const uniqueLinks = imageLinks.filter(link => !shop.imageCollection.includes(link));
    shop.imageCollection.push(...uniqueLinks);

    await shop.save();
    return shop.imageCollection;
  },

  async removeImageLinks(shopId, imageLinks) {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error("Shop not found");
    }
    shop.imageCollection = shop.imageCollection.filter(link => !imageLinks.includes(link));
    await shop.save();
    return shop.imageCollection;
  },

};

export default ShopService;
