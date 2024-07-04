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

    const products = []
    rawCart.products.forEach((item) =>
    {
      //copy to ensure no repeat info of product since we can have many records having the same product's ID
      const targetProduct = JSON.parse(JSON.stringify(productInfos.get(item.product.toString())))

      targetProduct.itemId = item._id.toString()
      targetProduct.quantity = item.quantity
      targetProduct.color = item.color
      targetProduct.size = item.size

      // return newProductValue
      products.push(targetProduct)
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

    const mapOfCurrentProducts = new Map()
    rawCart.products.forEach((item, index) =>
    {
      const itemId = item._id.toString()
      mapOfCurrentProducts.set(itemId, index)
    })

    productList.forEach((targetProduct) =>
    {
      const targetItemId = targetProduct.itemId
      const targetIndex = mapOfCurrentProducts.get(targetItemId)
      if(targetIndex != undefined)
      {
        rawCart.products[targetIndex].color = targetProduct.color
        rawCart.products[targetIndex].size = targetProduct.size
        rawCart.products[targetIndex].quantity = targetProduct.quantity
      }
    })
    
    mapOfCurrentProducts.clear()

    const mapOfReduceDuplicatedItems = new Map()
    rawCart.products.forEach((item) =>
    {
      if(item.quantity > 0)
      {
        const productId = item.product.toString()
        const color = item.color != null ? item.color.color.value : NullColorAttributeKey
        const size = item.size != null ? item.size : NullSizeAttributeKey
        const combinedKey = productId + "+" + color + "+" + size
  
        const currentValue = mapOfReduceDuplicatedItems.get(combinedKey)
        if(currentValue == undefined)
        {
          mapOfReduceDuplicatedItems.set(combinedKey, JSON.parse(JSON.stringify(item)))
        }
        else
        {
          currentValue.quantity += item.quantity
          mapOfReduceDuplicatedItems.set(combinedKey, currentValue)
        }
      }
    })    

    const newProductList = Array.from(mapOfReduceDuplicatedItems.values())
    rawCart.products = newProductList
    return (await rawCart.save()).products
  },

  async clearAllCartByUserId(userId)
  {
    const rawCart = await Cart.findOne({user: userId})
    if(rawCart == null)
    {
      return null
    }

    rawCart.products = []
    return await rawCart.save()
  },

  async clearCartByUserId(userId, targetItemIds)
  {
    const rawCart = await Cart.findOne({user: userId})
    if(rawCart == null)
    {
      return null
    }

    const updatedProductsInCart = rawCart.products.filter((item) => (targetItemIds.includes(item._id.toString() == false)))
    rawCart.products = updatedProductsInCart

    return await rawCart.save()
  },

  async addToCart(userId, providedProducts)
  {
    if(providedProducts == undefined)
    {
      return null
    }

    const rawCart = await Cart.findOne({user: userId})
    if(rawCart == null)
    {
      return null
    }

    const mapOfCurrentProducts = new Map()

    rawCart.products.forEach((item, index) =>
    {
      const productId = item.product.toString()
      const color = item.color != null ? item.color.color.value : NullColorAttributeKey
      const size = item.size != null ? item.size : NullSizeAttributeKey

      const combinedKey = productId + "+" + color + "+" + size
      mapOfCurrentProducts.set(combinedKey, index)
    })

    providedProducts.forEach((providedProduct) =>
    {
      const targetProductId = providedProduct.product
      const targetColor = providedProduct.color != null ? providedProduct.color.color.value : NullColorAttributeKey
      const targetSize = providedProduct.size != null ? providedProduct.size : NullSizeAttributeKey

      const targetCombinedKey = targetProductId + "+" + targetColor + "+" + targetSize
      const targetItemIndex = mapOfCurrentProducts.get(targetCombinedKey)
      if(targetItemIndex != undefined)
      {
        rawCart.products[targetItemIndex].quantity += providedProduct.quantity
      }
      else
      {
        //init new item record
        const clonedProduct = JSON.parse(JSON.stringify(providedProduct))
        clonedProduct.color = providedProduct.color != null ? providedProduct.color : undefined
        clonedProduct.size = providedProduct.size != null ? providedProduct.size : undefined
        rawCart.products.push(clonedProduct)
        mapOfCurrentProducts.set(targetCombinedKey, rawCart.products.length)
      }
    })
    
    return (await rawCart.save()).products
  },

};

export default CartService;
