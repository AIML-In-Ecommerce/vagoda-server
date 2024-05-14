import mongoose from "mongoose";
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
    const rawCart = await Cart.findById(id);
    const userId = rawCart.user.toString()

    return this.getByUserId(userId)
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

    const rawCart = await Cart.findOne({user: id}).exec()
    if(rawCart == null)
    {
      return null
    }

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

    fetchedProductInfos.forEach((product) =>
    {
      const productId = product._id.toString()
      productInfos.set(productId, product)
    })

    const products = rawCart.products.map((item) =>
    {
      const targetProduct = productInfos.get(item.product.toString())

      const newProductValue = 
      {
        _id: targetProduct._id,
        name: targetProduct.name,
        originalPrice: targetProduct.originalPrice,
        finalPrice: targetProduct.finalPrice,
        image: targetProduct.image[0],
        category: targetProduct.category,
        subCategory: targetProduct.subCategory,
        shop: targetProduct.shop,
        status: targetProduct.status,
        quantity: item.quantity,
      }

      return newProductValue
    })

    const finalResult = JSON.parse(JSON.stringify(rawCart))

    finalResult.products = products

    return finalResult;
  },

  /**
   * productList:
   *  [
   *    productId: string,
   *    quantity: number
   *  ]
   */
  async updateProducts(userId, productList)
  {
    if(!productList)
    {
      return false
    }

    const rawCart = await Cart.findOne({user: userId})

    if(!rawCart)
    {
      return null
    }

    const mapProductList = new Map()
    productList.forEach((value) =>
    {
      mapProductList.set(value.productId, value.quantity)
    })

    let clonedProductsList = []

    for(let i =0; i < rawCart.products.length; i++)
    {
      const item = rawCart.products[i]
      const newQuantity = mapProductList.get(item.product.toString())
      if(newQuantity > 0)
      {
        const newItem = 
        {
          product: item.product.toString(),
          quantity: newQuantity
        }

        clonedProductsList.push(newItem)
      }
    }

    if(clonedProductsList.length < 1)
    {
      for(let i = 0; i < productList.length; i++)
      {
        if(productList[i].quantity > 0)
        {
          const newItem = 
          {
            product: productList[i].productId,
            quantity: productList[i].quantity
          }

          clonedProductsList.push(newItem)
        }
      }
    }

    rawCart.products = clonedProductsList

    rawCart.save()

    return true;
  }

};

export default CartService;
