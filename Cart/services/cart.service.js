import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import ProductService from "../support/product.service.js";
import SupportStringService from "../support/string.service.js";

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

    const mapOfTargetProductInfos = new Map()
    providedProducts.forEach((record) =>
    {
      mapOfTargetProductInfos.set(record.product, -1)
    })

    const rawProductInfos = await ProductService.getProductByIds(Array.from(mapOfTargetProductInfos.keys()))
    if(rawProductInfos == null)
    {
      return null
    }

    rawProductInfos.forEach((productInfo, index) => 
    {
      mapOfTargetProductInfos.set(productInfo._id, index)
    })

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

        const targetProductInfoIndex  = mapOfTargetProductInfos.get(providedProduct.product)

        //ensure that the system will insert valid/existed products
        if(targetProductInfoIndex != undefined && targetProductInfoIndex != -1)
        {
          const rawTargetProductInfo = rawProductInfos[targetProductInfoIndex]

          if(rawTargetProductInfo.attribute.colors.length < 1)
          {
            clonedProduct.color = undefined
          }
          else if(providedProduct.color == null)
          {
            clonedProduct.color = rawTargetProductInfo.attribute.colors[0]
          }
          else
          {
            clonedProduct.color = providedProduct.color
          }

          if(rawTargetProductInfo.attribute.size.length < 1)
          {
            clonedProduct.size = undefined
          }
          else if(providedProduct.size == null)
          {
            clonedProduct.size = rawTargetProductInfo.attribute.size[0]
          }
          else
          {
            clonedProduct.size = providedProduct.size
          }

          rawCart.products.push(clonedProduct)
          mapOfCurrentProducts.set(targetCombinedKey, rawCart.products.length)
        }
      }
    })
    
    return (await rawCart.save()).products
  },

  async addToCartByStringDescriptions(userId, productId, color = undefined, size = undefined, quantity = undefined)
  {
    const rawCart = await Cart.findOne({user: userId})
    if(rawCart == null)
    {
      return null
    }

    const rawProductInfos = await ProductService.getProductByIds([productId])
    if(rawProductInfos == null)
    {
      return null
    }

    const targetProductInfo = rawProductInfos[0]

    let colorToBeInserted = undefined
    let sizeToBeInserted = undefined

    if(targetProductInfo.attribute.colors.length < 1)
    {
      colorToBeInserted = undefined
    }
    else if(color != undefined && color != null && color.length > 0)
    {
      const mapOfReduceColorDescription = new Map()
      targetProductInfo.attribute.colors.forEach((colorRecord, index) =>
      {
        const colorLabel = JSON.parse(JSON.stringify(colorRecord.color.label))
        if(colorLabel != undefined)
        {
          let reducedString = SupportStringService.reduceVowelsInString(colorLabel, true)
          reducedString = reducedString.toLowerCase()
          mapOfReduceColorDescription.set(reducedString, index)
        }
      })

      let reducedVowelColor = SupportStringService.reduceVowelsInString(color, true)
      reducedVowelColor = reducedVowelColor.toLowerCase()

      const targetIndex = mapOfReduceColorDescription.get(reducedVowelColor)
      
      if(targetIndex != undefined)
      {
        colorToBeInserted = targetProductInfo.attribute.colors[targetIndex]
      }
      else
      {
        colorToBeInserted = targetProductInfo.attribute.colors[0]
      }
    }
    else
    {
      colorToBeInserted = targetProductInfo.attribute.colors[0]
    }

    if(targetProductInfo.attribute.size.length < 1)
    {
      sizeToBeInserted = undefined
    }
    else if(size != undefined && size != null & size.length > 0)
    {
      const mapOfReduceSizeDescription = new Map()
      targetProductInfo.attribute.size.forEach((sizeRecord) =>
      {
        const sizeLabel = JSON.parse(JSON.stringify(sizeRecord, index))
        if(sizeLabel != undefined)
        {
          let reduceString = SupportStringService.reduceVowelsInString(sizeLabel, true)
          reduceString = reduceString.toLowerCase()
          mapOfReduceSizeDescription.set(reduceString, index)
        }
      })

      let reduceSizeVowel = SupportStringService.reduceVowelsInString(size, true)
      reduceSizeVowel = reduceSizeVowel.toLowerCase()

      const targetIndex = mapOfReduceSizeDescription.get(reduceSizeVowel)
      if(targetIndex != undefined)
      {
        sizeToBeInserted = targetProductInfo.attribute.size[targetIndex]
      }
      else
      {
        sizeToBeInserted = targetProductInfo.attribute.size[0]
      }
    }
    else
    {
      sizeToBeInserted = targetProductInfo.attribute.size[0]
    }

    let quantityToBeInserted = 1
    if(quantity != undefined && quantity != null && (Number(quantity) > 0))
    {
      quantityToBeInserted = Number(quantity)
    }

    const cartItemToBeInserted = {
      product: productId,
      color: colorToBeInserted,
      size: sizeToBeInserted,
      quantity: quantityToBeInserted
    }

    //a map contains indexes of product's info in rawCart
    const mapOfCurrentProducts = new Map()

    rawCart.products.forEach((item, index) =>
    {
      const productId = item.product.toString()
      const color = item.color != null ? item.color.color.value : NullColorAttributeKey
      const size = item.size != null ? item.size : NullSizeAttributeKey

      const combinedKey = productId + "+" + color + "+" + size
      mapOfCurrentProducts.set(combinedKey, index)
    })

    const getCombinedKey = () => 
    {
      const color = cartItemToBeInserted.color != null ? cartItemToBeInserted.color.color.value : NullColorAttributeKey
      const size = cartItemToBeInserted.size != null ? cartItemToBeInserted.size : NullSizeAttributeKey
      const productId = cartItemToBeInserted.product

      return productId + "+" + color + "+" + size
    }

    const existedItemIndexInCart = mapOfCurrentProducts.get(getCombinedKey())
    if(existedItemIndexInCart == undefined)
    {
      //create new
      rawCart.products.push(cartItemToBeInserted)
    }
    else
    {
      rawCart.products[existedItemIndexInCart].quantity += cartItemToBeInserted.quantity
    }

    return (await rawCart.save()).products
  },

};

export default CartService;
