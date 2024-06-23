import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import ProductService from "../support/product.service.js";

const NullColorAttributeKey = "_color_"
const NullSizeAttributeKey = "_size_"

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

      // const newProductValue = 
      // {
      //   _id: targetProduct._id,
      //   name: targetProduct.name,
      //   originalPrice: targetProduct.originalPrice,
      //   finalPrice: targetProduct.finalPrice,
      //   image: targetProduct.images[0],
      //   category: targetProduct.category,
      //   subCategory: targetProduct.subCategory,
      //   shop: targetProduct.shop,
      //   status: targetProduct.status,
      //   quantity: item.quantity,
      // }

      targetProduct.quantity = item.quantity
      targetProduct.color = item.color
      targetProduct.size = item.size

      // return newProductValue
      return targetProduct
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
      return null
    }

    const rawCart = await Cart.findOne({user: userId})

    if(rawCart == null)
    {
      return null
    }

    const mapProductList = new Map()

    rawCart.products.forEach((product) =>
    {
      const clonedProduct = JSON.parse(JSON.stringify(product))
      const color = clonedProduct.color == null ? NullColorAttributeKey : clonedProduct.color.color.value
      const size = clonedProduct.size == null ? NullSizeAttributeKey : clonedProduct.size
      const combinedKey = clonedProduct.product + "+" + color + "+" + size

      mapProductList.set(combinedKey, clonedProduct)
    })

    let clonedProductsList = []

    productList.forEach((providedProduct) =>
    {
      const color = providedProduct.color == null ? NullColorAttributeKey : providedProduct.color.color.value
      const size = providedProduct.size == null ? NullSizeAttributeKey : providedProduct.size
      const combinedKey = providedProduct.product + "+" + color + "+" + size

      const targetProduct = mapProductList.get(combinedKey)
      if(targetProduct != undefined)
      {
        targetProduct.quantity = providedProduct.quantity
        mapProductList.set(combinedKey, targetProduct)
      }
      else
      {
        //insert new product info
        const clonedProduct = JSON.parse(JSON.stringify(providedProduct))
        clonedProduct.color = providedProduct.color == null ? undefined : providedProduct.color
        clonedProduct.size = providedProduct.size == null ? undefined : providedProduct.size
        mapProductList.set(combinedKey, clonedProduct)
      }

    })

    mapProductList.forEach((value, key) =>
    {
      if(value.quantity > 0)
      {
        clonedProductsList.push(value)
      }
    })

    rawCart.products = clonedProductsList

    await rawCart.save()

    return rawCart.products;
  },

  async clearCartByUserId(userId)
  {
    const rawCart = await Cart.findOne({user: userId})
    if(rawCart == null)
    {
      return null
    }

    rawCart.products = []
    return await rawCart.save()
  },

};

export default CartService;
