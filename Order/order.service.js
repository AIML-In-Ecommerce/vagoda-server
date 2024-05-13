
import Order from "./order.model.js";
import ProductService from "./support/product.service.js";
import PromotionService from "./support/promotion.service.js";
import ShopService from "./support/shop.service.js";
import UserService from "./support/user.service.js";


const OrderService = {

  async getAllCustomerOrders(filter, projection) 
  {
    const userId = filter.userId
    //fetch user's data
    let userInfo = await UserService.getUserInfo(userId)

    if(userInfo == null)
    {
      return null
    }

    const listOfOrders = await Order.find(
    {
      filter:
      {
        user: userId
      }
    })
    .exec()

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


    const finalResutl = listOfOrders.map((value) =>
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
        const targetProduct = productsInfos.get(product.product.toString())
        return(
          {
            _id: targetProduct._id,
            name: targetProduct.name,
            image: targetProduct.image[0],
            originalPrice: targetProduct.originalPrice,
            purchasedPrice: product.purchasedPrice,
            quantity: product.quantity
          }
        )
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


    return finalResutl
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
  
  
      const finalResutl = JSON.parse(JSON.stringify(rawOrder))

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
        const targetProduct = productInfos.get(value.product.toString())
        return(
          {
            _id: targetProduct._id,
            name: targetProduct.name,
            originalPrice: targetProduct.originalPrice,
            image: targetProduct.image[0],
            purchasedPrice: value.purchasedPrice,
            quantity: value.quantity
          }
        )
      })
  
      //promotion and paymentMethod

      finalResutl.user = user
      finalResutl.shop = shop
      finalResutl.products = products
  
      return finalResutl
    }
    catch(error)
    {
      console.log(error)

      return null;
    }

  },

  async create(objectData) {
    const newObject = new Order(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Order.findByIdAndDelete(id);
  },
};

export default OrderService;
