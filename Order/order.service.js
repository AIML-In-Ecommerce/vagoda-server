
import Order from "./order.model.js";
import initOrderStatusGeneratorProvider from "./providers/init.order.status.generator.provider.js";
import orderGeneratorProvider from "./providers/order.generator.provider.js";
import orderPaymentInfoProvider from "./providers/order.payment_info.provider.js";
import orderStatusGeneratorProvider from "./providers/order.status.generator.provider.js";
import ProductService from "./support/product.service.js";
import ShopService from "./support/shop.service.js";
import UserService from "./support/user.service.js";


const OrderService = {

  async getAllCustomerOrders(userId) 
  {
    //fetch user's data
    let userInfo = await UserService.getUserInfo(userId)
    console.log("userInfo")
    console.log(userInfo)
    if(userInfo == null)
    {
      return null
    }

    const listOfOrders = await Order.find({user: userId})
    console.log(listOfOrders)
    if(listOfOrders.length == 0)
    {
      return []
    }

    const shopInfos = new Map()
    const productsInfos = new Map()
    // const promotionIds = new Map()
    // const paymentMethodIds = new Map()

    listOfOrders.forEach((value) =>
    {
      const shopId = value.shop
      shopInfos.set(shopId.toString(), {})

      // if(value.promotion != null)
      // {
      //   promotionIds.set(value.promotion.toString(), {})
      // }
      // if(value.paymentMethod != null)
      // {
      //   paymentMethodIds.set(value.paymentMethod.toString(), {})
      // }

    })

    //fetch shop's infos
    const fetchedShopInfos = await ShopService.getShopInfos(Array.from(shopInfos.keys()))
    if(fetchedShopInfos == null)
    {
      return null;
    }

    fetchedShopInfos.forEach((value) =>
    {
      const item = 
      {
        _id: value._id,
        name: value.name,
        location: value.location
      }

      shopInfos.set(item._id.toString(), item)
    })

    // //fetch promotion infos
    // const fetchedPromotionsInfos = await PromotionService.getPromotionByIds(promotionIds.keys())
    // if(fetchedPromotionsInfos == null)
    // {
    //   return null
    // }

    // //fetch payment method
    // //TODO: update payment method later

    //fetch product's infos
    listOfOrders.forEach((value) =>
    {
      value.products.forEach((item) =>
      {
        productsInfos.set(item.product.toString(), {})
      })
    })

    const fetchedProductInfos = await ProductService.getProductByIds(Array.from(productsInfos.keys()))
    console.log(fetchedProductInfos)
    if(fetchedProductInfos == null)
    {
      return null
    }

    fetchedProductInfos.forEach((product) =>
    {
      productsInfos.set(product._id, product)
    })


    const finalResult = listOfOrders.map((value) =>
    {
      const item = JSON.parse(JSON.stringify(value))
      //map user to Item
      const user = 
      {
        _id: userInfo._id,
        fullName: userInfo.fullName,
      }

      const targetShop = shopInfos.get(item.shop.toString())

      const shop = 
      {
        _id: targetShop._id,
        name: targetShop.name,
        location: targetShop.location
      }

      const products = item.products.map((product) =>
      {
        const targetProduct = JSON.parse(JSON.stringify(productsInfos.get(product.product.toString())))

        targetProduct.finalPrice = undefined
        targetProduct.purchasedPrice = product.purchasedPrice
        targetProduct.quantity = product.quantity

        return targetProduct
        // return(
        //   {
        //     _id: targetProduct._id,
        //     name: targetProduct.name,
        //     image: targetProduct.images[0],
        //     originalPrice: targetProduct.originalPrice,
        //     purchasedPrice: product.purchasedPrice,
        //     quantity: product.quantity
        //   }
        // )
      })

      //construct promotion and paymemt method here, later

      //finally, re-assign fields of item
      item.user = user
      item.shop = shop
      item.products = products
      //item.promotion = promotion
      //item.paymentMethod = paymentMethod

      return item
    })


    return finalResult
  },

  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(orderId) {
    try
    {
      const rawOrder = await Order.findOne({_id: orderId})

      if(rawOrder == null)
      {
        return null;
      }
      // fetch user's data
      let userInfo = await UserService.getUserInfo(rawOrder.user.toString())
  
      const productInfos = new Map()

      if(userInfo == null)
      {
        return null
      }
  
      //fetch shop's infos
      const shopInfo = await ShopService.getShopInfo(rawOrder.shop.toString())
      if(shopInfo == null)
      {
        return null;
      }
  
      //fetch promotion infos
  
      //fetch payment method
      //TODO: update payment method later
  
      //fetch product's infos
      rawOrder.products.forEach((value) =>
      {
        productInfos.set(value.product.toString(), {})
      })
  
      const fetchedProductInfos = await ProductService.getProductByIds(Array.from(productInfos.keys()))
      if(fetchedProductInfos == null)
      {
        return null
      }
      
      fetchedProductInfos.forEach((product) =>
      {
        productInfos.set(product._id.toString(), product)
      })
  
  
      const finalResult = JSON.parse(JSON.stringify(rawOrder))

      const user = 
      {
        _id: userInfo._id,
        fullName: userInfo.fullName,
      }

      const shop = 
      {
        _id: shopInfo._id,
        name: shopInfo.name,
        location: shopInfo.location
      }

      const products = rawOrder.products.map((value) =>
      {
        const targetProduct = JSON.parse(JSON.stringify(productInfos.get(value.product.toString())))

        targetProduct.finalPrice = undefined
        targetProduct.purchasedPrice = value.purchasedPrice
        targetProduct.quantity = value.quantity

        return targetProduct
        return(
          {
            _id: targetProduct._id,
            name: targetProduct.name,
            originalPrice: targetProduct.originalPrice,
            image: targetProduct.images[0],
            purchasedPrice: value.purchasedPrice,
            quantity: value.quantity
          }
        )
      })
  
      //promotion and paymentMethod

      finalResult.user = user
      finalResult.shop = shop
      finalResult.products = products
  
      return finalResult
    }
    catch(error)
    {
      console.log(error)

      return null;
    }

  },

  /**
   * 
   * @param {object} requiredData 
   * {
   *  userId: string,
   *  shippingAddressId: string,
   *  promotionId: string
   *  paymentMethodId: string
   * }
   */
  async create(requiredData) 
  {
    const paymentMethodId = requiredData.paymentMethodId
    const generator = orderGeneratorProvider.getGenerator(paymentMethodId)
    if(generator == undefined)
    {
      return null
    }

    return generator(requiredData)
  },

  async updateOrderStatus(orderId, shopId = undefined, userId = undefined, specStatusCode = undefined)
  {
    const completeTime = new Date(Date.now())

    let rawOrder = null

    if(shopId != undefined)
    {
      rawOrder = await Order.findOne({_id: orderId, shop: shopId})
    }
    else if(userId != undefined)
    {
      rawOrder = await Order.findOne({_id: orderId, user: userId})
    }

    if(rawOrder == null)
    {
      return false
    }

    const currentOrderStatus = rawOrder.orderStatus[rawOrder.orderStatus.length - 1]
    let newStatus = null
    if(specStatusCode == undefined)
    {
      newStatus = orderStatusGeneratorProvider.getStatusSequently(currentOrderStatus.status)
    }
    else
    {
      newStatus = orderStatusGeneratorProvider.getStatus(specStatusCode)
    }
    if(newStatus == null)
    {
      return false
    }

    rawOrder.orderStatus[rawOrder.orderStatus.length - 1].complete = completeTime
    rawOrder.orderStatus.push(newStatus)
    await rawOrder.save()

    return true
  },

  // async cancelOrderByUser(orderId)
  // {
  //   const rawOrder = await Order.findById(orderId)
  //   if(rawOrder == null)
  //   {
  //     return false
  //   }

  //   const currentStatus = rawOrder.orderStatus[rawOrder.orderStatus.length - 1]
  //   if(currentStatus.status != OrderStatus.WAITING_ONLINE_PAYMENT && currentStatus.status != OrderStatus.PENDING)
  //   {
  //     return false
  //   }

  //   rawOrder.orderStatus[rawOrder.orderStatus.length - 1].complete = new Date(Date.now())

  //   const cancelledStatus = orderStatusGeneratorProvider.getStatus(OrderStatus.CANCELLED)

  //   rawOrder.orderStatus.push(cancelledStatus)
    
  //   await rawOrder.save()

  //   return true
  // },

  async updateManyOrderStatus(orderIds, shopId = undefined, userId = undefined, specStatusCode = undefined)
  {
    const completeTime = new Date(Date.now())

    let rawOrders = null
    if(shopId != undefined)
    {
      rawOrders = await Order.find({_id: {$in: orderIds}, shop: shopId})
    }
    else if(userId != undefined)
    {
      rawOrders = await Order.find({_id: {$in: orderIds}, user: userId})
    }

    if(rawOrders == null)
    {
      return []
    }

    const successfulUpdatedList = []

    rawOrders.forEach(async (rawOrder) =>
    {
      const currentOrderStatus = rawOrder.orderStatus[rawOrder.orderStatus.length - 1]
      let newStatus = null
      if(specStatusCode == undefined)
      {
        newStatus = orderStatusGeneratorProvider.getStatusSequently(currentOrderStatus.status)
      }
      else
      {
        newStatus = orderStatusGeneratorProvider.getStatus(specStatusCode)
      }

      if(newStatus != null)
      {
        rawOrder.orderStatus[rawOrder.orderStatus.length - 1].complete = completeTime
        rawOrder.orderStatus.push(newStatus)
        await rawOrder.save()
        successfulUpdatedList.push(rawOrder._id.toString())
      }
    })
    
    return successfulUpdatedList
  },
  
  async updateOnePaymentInfo(orderId, paymentMethodCode, newPaymentInfo, userId = undefined, shopId = undefined)
  {
    let rawOrder = null
    if(shopId != undefined)
    {
      rawOrder = await Order.findOne({_id: orderId, shop: shopId})
    }
    else if(userId != undefined)
    {
      rawOrder = await Order.findOne({_id: orderId, user: userId})
    }

    if(rawOrder == null)
    {
      return false
    }

    const newPaymentInfoGenerated = orderPaymentInfoProvider.getUpdatedPaymentInfoSchema(paymentMethodCode, newPaymentInfo)

    rawOrder.paymentMethod = newPaymentInfoGenerated

    await rawOrder.save()
    return true
  },

  async updateManyPaymentInfo(orderIds, paymentMethodCode, newPaymentInfo, userId = undefined, shopId = undefined)
  {
    let rawOrders = null
    if(shopId != undefined)
    {
      rawOrders = await Order.find({_id: {$in: orderIds}, shop: shopId})
    }
    else if(userId != undefined)
    {
      rawOrders = await Order.find({_id: {$in: orderIds}, user: userId})
    }
    const successfulUpdatedList = []

    rawOrders.forEach(async (rawOrder) =>
    {
      const newPaymentInfoGenerated = orderPaymentInfoProvider.getUpdatedPaymentInfoSchema(paymentMethodCode, newPaymentInfo)

      rawOrder.paymentMethod = newPaymentInfoGenerated
      
      await rawOrder.save()
      successfulUpdatedList.push(rawOrder._id.toString())
    })

    return successfulUpdatedList
  },


};

export default OrderService;
