
import Order from "./order.model.js";
import orderGeneratorProvider from "./providers/order.generator.provider.js";
import orderPaymentInfoProvider from "./providers/order.payment_info.provider.js";
import orderStatusGeneratorProvider from "./providers/order.status.generator.provider.js";
import { OrderStatus } from "./shared/enums.js";
import CartService from "./support/cart.service.js";
import ProductService from "./support/product.service.js";
import ShopService from "./support/shop.service.js";
import UserService from "./support/user.service.js";


const OrderService = {

  async getAllCustomerOrders(userId) 
  {
    //fetch user's data
    let userInfo = await UserService.getUserInfo(userId)
    if(userInfo == null)
    {
      return null
    }

    const listOfOrders = await Order.find({user: userId})
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
        targetProduct.color = product.color,
        targetProduct.size = product.size
        targetProduct.quantity = product.quantity
        targetProduct.itemId = product._id.toString()

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
        targetProduct.color = value.color
        targetProduct.size = value.size
        targetProduct.quantity = value.quantity
        targetProduct.itemId = value._id.toString()

        return targetProduct
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

  async updateOrderStatus(orderId, execTime = undefined, shopId = undefined, userId = undefined, specStatusCode = undefined)
  {
    let completeTime = new Date(Date.now())
    if(execTime != undefined)
    {
      completeTime = new Date(execTime)
    }

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
    if(currentOrderStatus.status == OrderStatus.COMPLETED && currentOrderStatus.complete != null)
    {
      return true
    }
    else if(currentOrderStatus.status == OrderStatus.COMPLETED && currentOrderStatus.complete == null)
    {
      rawOrder.orderStatus[rawOrder.orderStatus.length - 1].complete = completeTime
      await rawOrder.save()
      return true
    }
    else if(currentOrderStatus.status == OrderStatus.CANCELLED && currentOrderStatus.complete != null)
    {
      return true
    }
    else if(currentOrderStatus.status == OrderStatus.CANCELLED && currentOrderStatus.complete == null)
    {
      rawOrder.orderStatus[rawOrder.orderStatus.length - 1].complete = completeTime
      await rawOrder.save()
      return true
    }
    
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


  async updateManyOrderStatus(orderIds, execTime, shopId = undefined, userId = undefined, specStatusCode = undefined)
  {
    let completeTime = new Date(Date.now())
    if(execTime != undefined)
    {
      completeTime = new Date(execTime)
    }

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

    for(let i =0; i < rawOrders.length; i++)
    {
      const currentOrderStatus = rawOrders[i].orderStatus[rawOrders[i].orderStatus.length - 1]
      if(currentOrderStatus.status == OrderStatus.COMPLETED && currentOrderStatus.complete != null)
      {
        successfulUpdatedList.push(rawOrders[i]._id.toString())
      }
      if(currentOrderStatus.status == OrderStatus.COMPLETED && currentOrderStatus.complete == null)
      {
        rawOrders[i].orderStatus[rawOrders[i].orderStatus.length - 1].complete = completeTime
        await rawOrders[i].save()
      }
      else if(currentOrderStatus.status == OrderStatus.CANCELLED && currentOrderStatus.complete != null)
      {
        successfulUpdatedList.push(rawOrders[i]._id.toString())
      }
      else if(currentOrderStatus.status == OrderStatus.CANCELLED && currentOrderStatus.complete == null)
      {
        rawOrders[i].orderStatus[rawOrders[i].orderStatus.length - 1].complete = completeTime
        await rawOrders[i].save()
        successfulUpdatedList.push(rawOrders[i]._id.toString())
      }
      else
      {
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
          rawOrders[i].orderStatus[rawOrders[i].orderStatus.length - 1].complete = completeTime
          rawOrders[i].orderStatus.push(newStatus)
          await rawOrders[i].save()
          successfulUpdatedList.push(rawOrders[i]._id.toString())
        }
      }
    }
    
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

  async getAllSellerOrders(shopId, targetOrderStatus = undefined)
  {

    let listOfOrders = await Order.find({shop: shopId})
    if(listOfOrders == null)
    {
      return null
    }

    if(listOfOrders.length == 0)
    {
      return []
    }

    if(targetOrderStatus != undefined)
    {
      listOfOrders = listOfOrders.filter((order) => order.orderStatus[order.orderStatus.length - 1].status == targetOrderStatus)
    }


    const userInfos = new Map()
    const productsInfos = new Map()
    // const promotionIds = new Map()
    // const paymentMethodIds = new Map()

    listOfOrders.forEach((value) =>
    {
      const userId = value.user
      userInfos.set(userId.toString(), {})

      // if(value.promotion != null)
      // {
      //   promotionIds.set(value.promotion.toString(), {})
      // }
      // if(value.paymentMethod != null)
      // {
      //   paymentMethodIds.set(value.paymentMethod.toString(), {})
      // }

    })

    //fetch userinfo
    const fetchedUserInfos = await UserService.getListOfUserInfos(Array.from(userInfos.keys()), false)
    if(fetchedUserInfos == null)
    {
      return null
    }

    fetchedUserInfos.forEach((value) =>
    {
      const info = 
      {
        _id: value._id,
        fullName: value.fullName,
      }

      userInfos.set(value._id, info)
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

      const user = userInfos.get(item.user.toString())

      const products = item.products.map((product) =>
      {
        const targetProduct = JSON.parse(JSON.stringify(productsInfos.get(product.product.toString())))

        targetProduct.finalPrice = undefined
        targetProduct.purchasedPrice = product.purchasedPrice
        targetProduct.quantity = product.quantity
        targetProduct.itemId = product._id.toString()

        return targetProduct
      })

      //construct promotion and paymemt method here, later

      //finally, re-assign fields of item
      item.user = user
      item.products = products
      //item.promotion = promotion

      return item
    })


    return finalResult
  },
  //revenue of a shop by month and year
  async getRevenue(shop, y){
    try {
      console.log("service: ", shop, y)
      // get all order of a shop in year
      let orders = await Order.find({shop: shop});
      orders = orders.filter(order => new Date(order.createAt).getFullYear() == y);
      console.log("order length", orders.length)
      //revenue of a shop by month
      const revenue = new Array(12).fill(0);
      console.log(orders)
      orders.forEach(order => {
        console.log(order.createAt)
        console.log(typeof order.createAt)
        const month = new Date(order.createAt).getMonth();
        console.log("get month", month)
        revenue[month] += order.totalPrice;
      });
      return revenue;

      
    } catch (error) {
      console.log(error);
      return error
    }
  },

  async getItemInOrder(orderId, itemId)
  {
    const rawOrder = await Order.findOne({_id: orderId})
    if(rawOrder == null)
    {
      return null
    }

    let targetItem = null

    for(let i = 0; i < rawOrder.products.length; i++)
    {
      if(rawOrder.products[i]._id.toString() == itemId)
      {
        targetItem = JSON.parse(JSON.stringify(rawOrder.products[i]))
        break
      }
    }

    if(targetItem == null)
    {
      return null
    }

    const productInfos = await ProductService.getProductByIds([targetItem.product])
    if(productInfos == null)
    {
      return null
    }
    
    const targetProductInfo = productInfos[0]

    targetProductInfo.itemId = itemId
    targetProductInfo.color = targetItem.color
    targetProductInfo.size = targetItem.size
    targetProductInfo.quantity = targetItem.quantity
    targetProductInfo.purchasedPrice = targetItem.purchasedPrice

    return targetProductInfo
  },

  async repurchaseItem(orderId, itemId)
  {
    const rawOrder = await Order.findById(orderId)
    if(rawOrder == null)
    {
      return null
    }

    const targetItem = rawOrder.products.find((item) => item._id.toString() == itemId)
    if(targetItem == undefined)
    {
      return null
    }

    const targetUserId = rawOrder.user.toString()

    const recontructedItemProps = {
      product: targetItem.product.toString(),
      color: targetItem.color,
      size: targetItem.size,
      quantity: 1
    }

    const newProductsInCart = await CartService.addToCart(targetUserId, [recontructedItemProps])
    
    return newProductsInCart
  }


};

export default OrderService;
