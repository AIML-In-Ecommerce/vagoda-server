import orderStatusGeneratorProvider from "../providers/init.order.status.generator.provider.js"
import PaymentService from "../support/payment.service.js"
import UserService from "../support/user.service.js"
import CartService from "../support/cart.service.js"
import Order from "../order.model.js"
import orderPaymentInfoProvider from "../providers/order.payment_info.provider.js"


async function generateOrder(requiredData)
{
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

    const cartInfo = await CartService.getCartInfoByUserId(userId)
    if(cartInfo == null || cartInfo.products.length == 0)
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

    let promotionInfo = null
    //TODO: fetch promotion
    if(requiredData.promotion != null)
    {

    }

    //create orders to specified shops according to shopId on each product's info
    const shopIds = Array.from(productsOnShop.keys())
        
    const initStatus = orderStatusGeneratorProvider.generateOrderStatus(requiredData.paymentMethodId)

    const newOrders = shopIds.map((shopId) =>
    {
      const targetProducts = productsOnShop.get(shopId)
      let totalPrice = 0
      let profit = 0

      const productInfosInOrder = targetProducts.map((product) =>
      {
        const info = 
        {
          product: product._id,
          quantity: product.quantity,
          purchasedPrice: product.finalPrice
        }

        totalPrice = totalPrice + info.purchasedPrice*info.quantity
        profit = totalPrice - product.platformFee*info.quantity

        return info
      })

      const shippingFee = 0
      const promotionValue = 0

      if(promotionInfo != null)
      {
        //TODO: update promotion value which will be applied for this order
      }

      //totalPrice
      totalPrice = totalPrice + shippingFee - promotionValue
      profit = profit + shippingFee - promotionValue

      const initPaymentInfo = orderPaymentInfoProvider.getInitializedPaymentInfoSchema(requiredData.paymentMethodId)
      const newOrder = 
      {
        user: userId,
        shop: shopId,
        products: productInfosInOrder,
        paymentMethod: initPaymentInfo, //we will update it later
        shippingFee: shippingFee, // we will update it later
        totalPrice: totalPrice,
        profit: profit,
        shippingAddress: shippingAddress,
        orderStatus: [initStatus]
      }

      //be used later

      // if(promotionInfo != null)
      // {
      //   newOrder.promotion = promotionInfo._id
      // }

      return newOrder
    })

    const savedOrders = await Order.create(newOrders)

    //now, we want to return a full saved-orders list whose item is mapped to product info
    //And, as we found, the product list in each order is stable
    //Which means that it ensures savedOrders[i].products[j].product == ProductsOnShop.get(savedOrders[i].shop)[j] is true

    const finalResult = savedOrders.map((order) =>
    {
      const clonedOrder = JSON.parse(JSON.stringify(order))
      const targetProducts = productsOnShop.get(clonedOrder.shop.toString()) //already have quantity value
      for(let i = 0; i < targetProducts.length; i++)
      {
        const purchasedPrice = targetProducts[i].finalPrice
        targetProducts[i].purchasedPrice = purchasedPrice
        targetProducts[i].finalPrice = undefined
      }

      clonedOrder.products = targetProducts
      return clonedOrder
    })

    return finalResult
}

const OrderGenerators = 
{
  async generateOrderWhenCOD(requiredData)
  {
      return generateOrder(requiredData)   
  },


  async generateOrderWhenZaloPay(requiredData)
  {
      const newOrders = await generateOrder(requiredData)
      //call to Payment service to ask for ZaloPay's payment url
  
      let totalAmount = 0
      let products = []
      const orderIds = newOrders.map((order) =>
      {
        totalAmount = totalAmount + order.totalPrice
        order.products.forEach((product) =>
        {
          products.push(product)
        })
        return order._id
      })
  
      const zalopayResponse = await PaymentService.getZaloPayURL(requiredData.userId, totalAmount, products, orderIds)
  
      if(zalopayResponse.order_url == undefined)
      {
        return null
      }
  
      const finalResult = 
      {
        order_url: zalopayResponse.order_url
      }
  
      return finalResult
  },

}


export default OrderGenerators