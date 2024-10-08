import orderStatusGeneratorProvider from "../providers/init.order.status.generator.provider.js"
import PaymentService from "../support/payment.service.js"
import UserService from "../support/user.service.js"
import CartService from "../support/cart.service.js"
import Order from "../order.model.js"
import orderPaymentInfoProvider from "../providers/order.payment_info.provider.js"
import PromotionService from "../support/promotion.service.js"

async function generateOrder(requiredData)
{
    const productNeedToBuy = requiredData.itemIds

    let execTime = new Date()
    if(requiredData.execTime != undefined)
    {
      execTime = new Date(requiredData.execTime)
    }

    const userId = requiredData.userId
    const userInfo = await UserService.getUserInfo(userId, "true")
    if(userInfo == null)
    {
      return null
    }

    const shippingAddress = userInfo.address.find((address) => address._id == requiredData.shippingAddressId)
    if(shippingAddress == undefined)
    {
      return null
    }

    let cartInfo = await CartService.getCartInfoByUserId(userId)
    if(cartInfo == null || cartInfo.products.length == 0)
    {
      return null
    }

    if(productNeedToBuy != undefined && productNeedToBuy != null && productNeedToBuy.length > 0)
    {
      const filteredProducts = cartInfo.products.filter((value) => productNeedToBuy.includes(value.itemId))
      cartInfo.products = filteredProducts
    }

    if(cartInfo.products.length < 1)
    {
      return null
    }


    const productsOnShop = new Map()

    //group products by shopId
    cartInfo.products.forEach((item) =>
    {
      const shopId = item.shop
      let productList = productsOnShop.get(shopId)
      if(productList == undefined)
      {
        const newProductList = new Array()
        newProductList.push(item)
        productsOnShop.set(shopId, newProductList)
      }
      else
      {   
        productList.push(item)
        productsOnShop.set(shopId, productList)
      }
    })

    let promotionInfosOnShops = null
    let listOfReferencePromotions = []
    //TODO: fetch promotion
    if(requiredData.promotionIds != undefined && requiredData.promotionIds != null
      && requiredData.promotionIds.length > 0 )
    {
      const fetchedPromotionInfos = await PromotionService.getPromotionByIds(requiredData.promotionIds)
      if(fetchedPromotionInfos != null)
      {
        listOfReferencePromotions = fetchedPromotionInfos.map((fetchedPromotionInfo) =>
        {
          const clonedPromotionInfo = JSON.parse(JSON.stringify(fetchedPromotionInfo))
          clonedPromotionInfo.limit = 1
          clonedPromotionInfo.usedTime = 0

          return clonedPromotionInfo
        })

        promotionInfosOnShops = new Map()
        //fetchedPromotionInfos.length is small
        for(let i = 0; i < fetchedPromotionInfos.length; i++)
        {
          const shopId = fetchedPromotionInfos[i].shop
          const activeDate = new Date(fetchedPromotionInfos[i].activeDate)
          const expiredDate = new Date(fetchedPromotionInfos[i].expiredDate)
          
          if(execTime.getTime() >= activeDate.getTime() && execTime.getTime() <= expiredDate.getTime()
          )
          {
            if(fetchedPromotionInfos[i].targetProducts.length == 0)
            {
              promotionInfosOnShops.set(shopId, {
                indexInFetchedPromotionInfos: i
              })
            }
            else
            {
              fetchedPromotionInfos[i].targetProducts.forEach((productId) =>
              {
                const combinedKey = shopId + "+" + productId
                promotionInfosOnShops.set(combinedKey, {
                  indexInFetchedPromotionInfos: i,
                })
              })
            }
          }
        }
      }
    }

    //create orders to specified shops according to shopId on each product's info
    const shopIds = Array.from(productsOnShop.keys())
        
    const initStatus = orderStatusGeneratorProvider.generateOrderStatus(requiredData.paymentMethodId)

    const newOrders = shopIds.map((shopId) =>
    {
      const targetProducts = productsOnShop.get(shopId)
      let totalPrice = 0
      let profit = 0

      const productInfosInOrder = []
      let promotion = null
      
      //this can ensures savedOrders[i].products[j].product == ProductsOnShop.get(savedOrders[i].shop)[j] is true
      for(let i = 0; i < targetProducts.length; i++)
      {
        const product = targetProducts[i]
        const info = 
        {
          product: product._id,
          color: product.color == null ? undefined : product.color,
          size: product.size == null ? undefined : product.size,
          quantity: product.quantity,
          purchasedPrice: product.finalPrice
        }

        let appliedDiscountValue = 0

        if(promotionInfosOnShops != null)
        {
          //TODO: update promotion value which will be applied for this order
          //here we try to get local promotion or promotions that are only available for some products in the shop
          const combinedKey = shopId + "+" + product._id
          const targetPromotion = promotionInfosOnShops.get(combinedKey)
          if(targetPromotion != undefined)
          {
            const targetPromotionInfo = listOfReferencePromotions[targetPromotion.indexInFetchedPromotionInfos]
            if(targetPromotionInfo.usedTime < targetPromotionInfo.limit)
            {
              appliedDiscountValue = PromotionService.calculateDiscountValue(targetPromotionInfo, product.finalPrice)

              //update the useTime value which makes it reach the limitation of use
              targetPromotion.usedTime = targetPromotion.usedTime + 1
              listOfReferencePromotions[targetPromotion.indexInFetchedPromotionInfos] = targetPromotionInfo
              promotion = targetPromotionInfo
            }
          }
        }
        productInfosInOrder.push(info)

        totalPrice += info.purchasedPrice*info.quantity - appliedDiscountValue
        profit = totalPrice - product.platformFee*info.quantity
      }

      //for global discount
      //since the global promotion doesnot have any target product's ID,
      //we only store global discount (promotion) in promotionInfoOnShops by the pair of <shopId, promotionInfo> 
      const globalPromotion = promotionInfosOnShops != null ? promotionInfosOnShops.get(shopId) : undefined

      if(globalPromotion != undefined)
      {
        const targetGlobalPromotion = listOfReferencePromotions[globalPromotion.indexInFetchedPromotionInfos]
        const globalDiscountValue = PromotionService.calculateDiscountValue(targetGlobalPromotion, totalPrice)

        totalPrice = totalPrice - globalDiscountValue
        profit = profit - globalDiscountValue
        promotion = targetGlobalPromotion
      }

      const shippingFee = 0

      const initPaymentInfo = orderPaymentInfoProvider.getInitializedPaymentInfoSchema(requiredData.paymentMethodId)
      const newOrder = 
      {
        user: userId,
        shop: shopId,
        products: productInfosInOrder,
        paymentMethod: initPaymentInfo,
        shippingFee: shippingFee, // we will update it later
        totalPrice: totalPrice,
        profit: profit,
        shippingAddress: shippingAddress,
        orderStatus: [initStatus]
      }

      if(promotion != null)
      {
        newOrder.promotion = 
        {
          _id: promotion._id,
          name: promotion.name,
          type: promotion.discountTypeInfo.type,
          value: promotion.discountTypeInfo.value
        }
      }

      return newOrder
    })

    const savedOrders = await Order.create(newOrders)

    //now, we want to return a full saved-orders list whose item is mapped to product info
    //And, as we found, the product list in each order is stable
    //Which means that it ensures savedOrders[i].products[j].product == ProductsOnShop.get(savedOrders[i].shop)[j] is true

    const createdOrders = savedOrders.map((order) =>
    {
      const clonedOrder = JSON.parse(JSON.stringify(order))
      const targetProducts = productsOnShop.get(clonedOrder.shop.toString()) //already have quantity value
      for(let i = 0; i < targetProducts.length; i++)
      {
        const purchasedPrice = clonedOrder.products[i].purchasedPrice
        targetProducts[i].itemId = clonedOrder.products[i].product
        targetProducts[i].purchasedPrice = purchasedPrice
        targetProducts[i].finalPrice = undefined
        targetProducts[i].size = clonedOrder.products[i].size
        targetProducts[i].color = clonedOrder.products[i].color
        targetProducts[i].quantity = clonedOrder.products[i].quantity
      }

      clonedOrder.products = targetProducts
      return clonedOrder
    })

    return createdOrders
}

const OrderGenerators = 
{
  async generateOrderWhenCOD(requiredData)
  {

    const newOrders = await generateOrder(requiredData)

    const newOrderIds = newOrders.map((orderInfo) =>
    {
      return orderInfo._id
    })

    return newOrderIds
  },


  async generateOrderWhenZaloPay(requiredData)
  {
      const newOrdersData = await generateOrder(requiredData)
      if(newOrdersData == null)
      {
        return null
      }
      //call to Payment service to ask for ZaloPay's payment url
  
      let totalAmount = 0
      let products = []
      const orderIds = newOrdersData.map((order) =>
      {
        totalAmount = totalAmount + order.totalPrice
        order.products.forEach((product) =>
        {
          products.push(product)
        })
        return order._id
      })
  
      const zalopayResponse = await PaymentService.getZaloPayURL(requiredData.userId, totalAmount, products, orderIds)
      console.log(zalopayResponse)
      if(zalopayResponse.order_url == undefined)
      {
        //TODO: set status to failed
        return null
      }
  
      const finalResult = 
      {
        order_url: zalopayResponse.order_url,
        orderIds: orderIds
      }
  
      return finalResult
  },

}


export default OrderGenerators