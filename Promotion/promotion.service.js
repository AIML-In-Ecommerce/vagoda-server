import Promotion from "./promotion.model.js";
import SupportProductService from "./support/product.service.js";
import SupportShopService from "./support/shop.service.js";

const PromotionService = {
  async getAll(filter, projection) {
    return await Promotion.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getByIds(listOfIds) {
    return await Promotion.find({
      _id: { $in: listOfIds },
    });
  },

  async getById(id) {
    const rawPromotion = await Promotion.findById(id);
    if(rawPromotion == null)
    {
      return null
    }

    let clonedPromotion = JSON.parse(JSON.stringify(rawPromotion))

    const shopInfo = await SupportShopService.getShopInfoByShopId(clonedPromotion.shop, true, false)
    if(shopInfo != null)
    {
      clonedPromotion.shop = {
        _id: shopInfo._id,
        name: shopInfo.name,
        avatarUrl: shopInfo.shopInfoDesign.avatarUrl
      }
    }

    return clonedPromotion
  },
  async getByShopId(shopId) {
    const rawPromotions = await Promotion.find({ shop: shopId });
    if(rawPromotions == null)
    {
      return null
    }

    const clonedPromotions = JSON.parse(JSON.stringify(rawPromotions))

    const shopInfo = await SupportShopService.getShopInfoByShopId(shopId, true, false)

    if(shopInfo != null)
    {
      for(let i = 0; i < clonedPromotions.length; i++)
      {
        const convertedShopInfo = {
          _id: shopInfo._id,
          name: shopInfo.name,
          avatarUrl: shopInfo.shopInfoDesign.avatarUrl
        }

        clonedPromotions[i].shop = convertedShopInfo
      }
    }

    return clonedPromotions
  },
  // async getByShopId(shopId) {
  //   return await Promotion.find({ shopId });
  // }
    
  async create(objectData) {
    const newObject = new Promotion(objectData);
    const rawPromotion = await newObject.save();
    if(rawPromotion == null)
    {
      return null
    }
    const clonedPromotion = JSON.parse(JSON.stringify(rawPromotion))

    const shopInfo = await SupportShopService.getShopInfoByShopId(clonedPromotion.shop, true, false)
    if(shopInfo != null)
    {
      clonedPromotion.shop = {
        _id: shopInfo._id,
        name: shopInfo.name,
        avatarUrl: shopInfo.shopInfoDesign.avatarUrl
      }
    }

    return clonedPromotion
  },

  async update(id, updateData) {
    const rawPromotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true });

    const clonedPromotion = JSON.parse(JSON.stringify(rawPromotion))
    const shopInfo = await SupportShopService.getShopInfoByShopId(clonedPromotion.shop, true, false)
    if(shopInfo != null)
    {
      clonedPromotion.shop = {
        _id: shopInfo._id,
        name: shopInfo.name,
        avatarUrl: shopInfo.shopInfoDesign.avatarUrl
      }
    }

    return clonedPromotion
  },

  async delete(id) {
    return await Promotion.findByIdAndDelete(id);
  },

  async getListByIds(ids) {
    const list = await Promotion.find({ _id: { $in: ids } });
    if(list == null)
    {
      return null
    }

    const clonedPromotions = JSON.parse(JSON.stringify(list))

    const shopInfos = await SupportShopService.getShopInfoByShopId(shopId, true, false)

    const mapOfShopInfoIndex = new Map()

    if(shopInfos != null)
    {
      shopInfos.forEach((shopInfo, index) =>
      {
        mapOfShopInfoIndex.set(shopInfo._id, index)
      })
    }

    for(let i = 0; i < clonedPromotions.length; i++)
    {
      const shopId = clonedPromotions[i].shop
      const shopInfoIndex = mapOfShopInfoIndex.get(shopId)
      if(shopInfoIndex != undefined)
      {
        const targetShopInfo = shopInfos[shopInfoIndex]
        clonedPromotions[i].shop = {
          _id: targetShopInfo._id,
          name: targetShopInfo.name,
          avatarUrl: targetShopInfo.shopInfoDesign.avatarUrl
        }
      }
    }
    
    return clonedPromotions;
  },

  async getPromotionBySelectionFromBuyer(shopId, lowerBoundaryForOrder, targetProducts, inActive = false)
  {
    const currentDatetime = new Date()
    let sentinel_requiredConditionCount = 0

    if(shopId == undefined || shopId == null)
    {
      return null
    }

    if(shopId.length == 0)
    {
      return null
    }


    let filterOption = {
      shop: shopId,
    }
    if(inActive != undefined && inActive == true)
    {
      filterOption.activeDate = {$lte: currentDatetime}
      filterOption.expiredDate = {$gte: currentDatetime}
    }

    //basely filter, do not increase the requiredConditionCount
    const rawPromtions = await Promotion.find(filterOption)
    if(rawPromtions == null)
    {
      return null
    }

    if(rawPromtions.length == 0)
    {
      return []
    }

    let relevantPromotions = new Map()
    
    //additional conditions
    if(lowerBoundaryForOrder == undefined || lowerBoundaryForOrder == null)
    {
      relevantPromotions = new Map(rawPromtions.map((promotion) => {
        const promotionId = promotion._id.toString()
        const clonedPromotion = JSON.parse(JSON.stringify(promotion))
        
        const newValueInMap = {
          requiredConditionCount: sentinel_requiredConditionCount,
          promotion: clonedPromotion
        }

        return [promotionId, newValueInMap]
      }))
    }
    else
    {
      sentinel_requiredConditionCount += 1

      rawPromtions.forEach((promotion) =>
      {
        if(promotion.discountTypeInfo.lowerBoundaryForOrder <= lowerBoundaryForOrder)
        {
          const promotionId = promotion._id.toString()
          const clonedPromotion = JSON.parse(JSON.stringify(promotion))
          const newValueInMap = {
            requiredConditionCount: sentinel_requiredConditionCount,
            promotion: clonedPromotion
          }

          relevantPromotions.set(promotionId, newValueInMap)
        }
      })
    }

    const listOfProductInfos = await SupportProductService.getProductInfosByIds(targetProducts)
    const shopInfo = await SupportShopService.getShopInfoByShopId(shopId, true, false)
    if(listOfProductInfos == null)
    {
      return []
    }
    else if(listOfProductInfos.length == 0)
    {
      return []
    }

    //check the targetProducts input
    const listOfValidProductInfos = listOfProductInfos.filter((record) => record.shop == shopId)
    if(listOfValidProductInfos.length == 0)
    {
      return []
    }
    
    const mapOfProductCanUsePromotion = new Map()

    if(targetProducts != undefined && targetProducts != null && targetProducts.length != 0)
    {

      sentinel_requiredConditionCount += 1

      rawPromtions.forEach((promotion) =>
      {
        const promotionId = promotion._id.toString()

        //if the targetProducts.length == 0 =>  this promotion can be apply for all products of this shop
        //then we only need to store the promotion with the greatest status of sentinel_requiredConditionCount's value
        if(promotion.targetProducts.length == 0)
        {
          const currentRelevantPromotion = relevantPromotions.get(promotionId)
          if(currentRelevantPromotion != undefined)
          {
            currentRelevantPromotion.requiredConditionCount = sentinel_requiredConditionCount
            relevantPromotions.set(promotionId, currentRelevantPromotion)
          }
        }
        else
        {
          promotion.targetProducts.forEach((productId) =>
            {
              const targetProductId = productId.toString()
              const currentValues = mapOfProductCanUsePromotion.get(targetProductId)
              if(currentValues == undefined)
              {
                //initialize the first value
                mapOfProductCanUsePromotion.set(targetProductId, [promotionId])
              }
              else
              {
                currentValues.push(promotionId)
                mapOfProductCanUsePromotion.set(targetProductId, currentValues)
              }
            })
        }
      })

      listOfValidProductInfos.forEach((record) =>
      {
        const targetPromotionIds = mapOfProductCanUsePromotion.get(record._id)
        if(targetPromotionIds != undefined)
        {
          targetPromotionIds.forEach((targetPromotionId) =>
          {
            const valueOfRelevantPromotion = relevantPromotions.get(targetPromotionId)
            if(valueOfRelevantPromotion != undefined)
            {
              valueOfRelevantPromotion.requiredConditionCount = sentinel_requiredConditionCount
              relevantPromotions.set(targetPromotionId, valueOfRelevantPromotion)
            }
          })
        }
      })
    }
    // else
    // {
    //   sentinel_requiredConditionCount += 1

    //   rawPromtions.forEach((promotion) =>
    //   {
    //     const promotionId = promotion._id.toString()

    //     //if the targetProducts.length == 0 =>  this promotion can be apply for all products of this shop
    //     //then we only need to store the promotion with the greatest status of sentinel_requiredConditionCount's value
    //     if(promotion.targetProducts.length == 0)
    //     {
    //       const currentRelevantPromotion = relevantPromotions.get(promotionId)
    //       if(currentRelevantPromotion != undefined)
    //       {
    //         currentRelevantPromotion.requiredConditionCount = sentinel_requiredConditionCount
    //         relevantPromotions.set(promotionId, currentRelevantPromotion)
    //       }
    //     }
    //   })
    // }

    mapOfProductCanUsePromotion.clear()

    //group by shop ID and choose suitable promotion record
    //by required-condition-count value

    const finalResult = []

    relevantPromotions.forEach((value, key) =>
    {
      const requiredConditionCount = value.requiredConditionCount
      const promotion = value.promotion

      if(requiredConditionCount == sentinel_requiredConditionCount)
      {
        finalResult.push(promotion)
      }
    })

    if(shopInfo != null)
    {
      for(let i = 0; i< finalResult.length; i++)
        {
          finalResult[i].shop = {
            _id: shopInfo._id,
            name: shopInfo.name,
            avatarUrl: shopInfo.shopInfoDesign.avatarUrl
          }
        }
    }

    return finalResult
  },

  async updatePromotionQuantity(promotionId, quantity)
  {
    const rawPromotion = await Promotion.findOne({_id: promotionId})
    if(rawPromotion == null)
    {
      return null
    }

    rawPromotion.quantity = quantity

    return (await rawPromotion.save())._id.toString()
  },

  async updateUsedPromotionsQuantity(promotionIds)
  {
    const rawPromotions = await Promotion.find({_id: {$in: promotionIds}})
    if(rawPromotions == null)
    {
      return null
    }

    const updatedPromotionIds = []
    for(let i = 0; i< rawPromotions.length; i++)
    {
      const rawPromotion = rawPromotions[i]
      rawPromotion.redeemedTotal = rawPromotion.redeemedTotal + 1
      const updatedPromotion = await rawPromotion.save()
      updatedPromotionIds.push(updatedPromotion._id.toString())
    }

    return updatedPromotionIds
  },

  async getPromotionsByCodes(shopId, codes)
  {
    const rawPromotions = await Promotion.find({shop: shopId, code: {$in: codes}})
    if(rawPromotions == null)
    {
      return null
    }

    const clonedPromotions = JSON.parse(JSON.stringify(rawPromotions))

    const shopInfo = await SupportShopService.getShopInfoByShopId(shopId, true, false)

    if(shopInfo != null)
    {
      for(let i = 0; i < clonedPromotions.length; i++)
      {
        clonedPromotions[i].shop = {
          _id: shopInfo._id,
          name: shopInfo.name,
          avatarUrl: shopInfo.shopInfoDesign.avatarUrl
        }
      }
    }

    return clonedPromotions
  },

  async updateCancelPromotionsQuantity(promotionIds)
  {
    const rawPromotions = await Promotion.find({_id: {$in: promotionIds}})
    if(rawPromotions == null)
    {
      return null
    }

    const updatedPromotionIds = []
    for(let i = 0; i< rawPromotions.length; i++)
    {
      const rawPromotion = rawPromotions[i]
      rawPromotion.redeemedTotal = rawPromotion.redeemedTotal - 1 < 0 ? 0 : rawPromotion.redeemedTotal - 1
      const updatedPromotion = await rawPromotion.save()
      updatedPromotionIds.push(updatedPromotion._id.toString())
    }

    return updatedPromotionIds
  },

};

export default PromotionService;
