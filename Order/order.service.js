import Order from "./order.model.js";
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

    const shopIds = new Map()
    const promotionIds = new Map()
    const paymentMethodIds = new Map()

    listOfOrders.forEach((value) =>
    {
      const shopId = value.shop
      shopIds.set(shopId.toString(), {})

      if(value.promotion != null)
      {
        promotionIds.set(value.promotion.toString(), {})
      }
      if(value.paymentMethod != null)
      {
        paymentMethodIds.set(value.paymentMethod.toString(), {})
      }

    })

    //fetch shop's infos
    const fetchedShopInfos = await ShopService.getShopInfos(shopIds.keys())
    if(fetchedShopInfos == null)
    {
      return null;
    }

    console.log(fetchedShopInfos)

    fetchedShopInfos.forEach((value) =>
    {
      const item = 
      {
        _id: value._id,
        name: value.name,
        location: value.location
      }

      shopIds.set(item._id.toString(), item)
    })

    //fetch promotion infos
    const fetchedPromotionsInfos = await PromotionService.getPromotionByIds(promotionIds.keys())
    if(fetchedPromotionsInfos == null)
    {
      return null
    }

    //fetch payment method
    //TODO: update payment method later



    return listOfOrders
  },

  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Order.findById(id);
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
