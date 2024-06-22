import Promotion from "./promotion.model.js";

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
    return await Promotion.findById(id);
  },
  async getByShopId(shopId) {
    return await Promotion.find({ shopId: shopId });
  },
  // async getByShopId(shopId) {
  //   return await Promotion.find({ shopId });
  // }
    
  async create(objectData) {
    const newObject = new Promotion(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Promotion.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Promotion.findByIdAndDelete(id);
  },

  async getListByIds(ids) {
    const list = await Promotion.find({ _id: { $in: ids } });
    return list;
  },

  async getPromotionBySelectionFromBuyer(shopIds, lowerBoundaryForOrder, targetProducts, inActive = false)
  {
    const currentDatetime = new Date()
    let sentinel_requiredConditionCount = 0

    if(shopIds == undefined)
    {
      return null
    }
    else if(shopIds.length == 0)
    {
      return null
    }

    let filterOption = {
      shop: {$in: shopIds},
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

    const mapOfProductCanUsePromotion = new Map()

    if(targetProducts != undefined && targetProducts != null && targetProducts.length != 0)
    {
      sentinel_requiredConditionCount += 1

      rawPromtions.forEach((promotion) =>
      {
        const promotionId = promotion._id.toString()

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
      })

      targetProducts.forEach((targetProductId) =>
      {
        const targetPromotionIds = mapOfProductCanUsePromotion.get(targetProductId)
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

    mapOfProductCanUsePromotion.clear()

    //group by shop ID and choose suitable promotion record
    //by required-condition-count value
    const groupOfPromotionsOfShops = new Map()

    relevantPromotions.forEach((value, key) =>
    {
      const requiredConditionCount = value.requiredConditionCount
      const promotion = value.promotion

      if(requiredConditionCount == sentinel_requiredConditionCount)
      {
        const targetShopId = promotion.shop
        const listOfPromotions = groupOfPromotionsOfShops.get(targetShopId)
        if(listOfPromotions == undefined)
        {
          groupOfPromotionsOfShops.set(targetShopId, [promotion])
        }
        else
        {
          listOfPromotions.push(promotion)
          groupOfPromotionsOfShops.set(targetShopId, listOfPromotions)
        }
      }
    })

    //convert into list of promotions according to list of shop's ID
    const finalResult = []

    groupOfPromotionsOfShops.forEach((value, key) =>
    {
      const recordOfResult = {
        shopId: key,
        promotions: value
      }

      finalResult.push(recordOfResult)
    })

    return finalResult
  },


};

export default PromotionService;
