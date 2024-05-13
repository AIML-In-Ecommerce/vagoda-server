import { Cart } from "./cart.model.js"
import ProductService from "./support/product.service.js";

const CartService = {
  async getAll(filter, projection) {
    return await Cart.find(filter).select(projection)
    .populate({
      path: 'products.product',
      model: 'Product',
    })
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Cart.findById(id);
  },

  async create(objectData) {
    const newObject = new Cart(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Cart.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Cart.findByIdAndDelete(id);
  },

  async getByUserId(id)
  {
    const rawCart = await Cart.findOne({_user: id})

    const productInfos = new Map()

    rawCart.products.forEach((item) =>
    {
      const productId = item.product.toString()
      productInfos.set(productId, {})
    })

    const fetchedProductInfos = await ProductService.getProductByIds(Array.from(productInfos.keys()))
    if(fetchedProductInfos == null)
    {
      return null;
    }

    // console.log(fetchedProductInfos)

    return null;
  },



};

export default CartService;
