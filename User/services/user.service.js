import User from "../models/user.model.js";

const UserService = {
  async getAll(filter, projection) {
    return await User.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id, useAddress = undefined) {
    
    if(useAddress == undefined)
    {
      return await User.findById(id);
    }
    else
    {
      if(useAddress == false)
      {
        return await User.findById(id).select("_id fullName avatar dob phoneNumber account createAt __v")
      }
      else
      {
        return await User.findById(id);
      }
    }
  },

  async getByAccountId(id, useAddress = undefined)
  {
    if(useAddress == undefined)
      {
        return await User.findOne({account: id});
      }
      else
      {
        if(useAddress == false)
        {
          return await User.findOne({account: id}).select("_id fullName avatar dob phoneNumber account createAt __v")
        }
        else
        {
          return await User.findOne({account: id});
        }
      }
  },

  async create(objectData) {
    const newObject = new User(objectData);
    const userInfo = await newObject.save();
    return userInfo._id.toString()
  },

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await User.findByIdAndDelete(id);
  },

  async insertShippingAddress(userId, newShippingAddress)
  {
    const rawUserInfo = await User.findById(userId)

    if(rawUserInfo == null)
    {
      return null;
    }

    const clonedAddress = JSON.parse(JSON.stringify(rawUserInfo.address))

    if(newShippingAddress.coordinate == null)
    {
      newShippingAddress.coordinate = {}
    }

    clonedAddress.push(newShippingAddress)

    rawUserInfo.address = clonedAddress

    await rawUserInfo.save()

    const addresses = JSON.parse(JSON.stringify(rawUserInfo.address))

    addresses.forEach((address) =>
    {
      if(address.coordinate != null && (address.coordinate.lng == undefined && address.coordinate.lat == undefined))
      {
        address.coordinate = null
      }
    })
  
    return addresses
  },

  async getShippingAddress(userId)
  {
    const rawUserInfo = await User.findById(userId)
    if(rawUserInfo == null)
    {
      return null
    }
  
    const addresses = JSON.parse(JSON.stringify(rawUserInfo.address))

    addresses.forEach((address) =>
    {
      if(address.coordinate != null && (address.coordinate.lng == undefined && address.coordinate.lat == undefined))
      {
        address.coordinate = null
      }
    })
  
    return addresses
  },

  /**
   * 
   * @param {string} userId:  
   * @param {string} documentId 
   * @param {
   *  receiverName: string,
   *  address: string,
   *  phoneNumber: string,
   *  coordinate: 
   *  {
   *    lng: number,
   *    lat: number,
   *  },
   *  label: ["HOME", "OFFICE"],
   *  isDefault: boolean
   * } newShippingAddress 
   */
  async updateShippingAddress(userId, documentId, newShippingAddress)
  {
    const rawUserInfo = await User.findById(userId)

    if(rawUserInfo == null)
    {
      return null
    }

    if(newShippingAddress.receiverName == undefined
      || newShippingAddress.phoneNumber == undefined || newShippingAddress.coordinate == undefined
      || newShippingAddress.label == undefined || newShippingAddress.isDefault == undefined
    )
    {
      return null;
    }

    let targetIndex = -1

    rawUserInfo.address.forEach((item, index) =>
    {
      const itemId = item._id.toString()
      if(itemId == documentId)
      {
        targetIndex = index
      }
    })

    if(targetIndex == -1)
    {
      return rawUserInfo.address
    }

    if(newShippingAddress.coordinate == null)
    {
      newShippingAddress.coordinate = {}
    }

    rawUserInfo.address[targetIndex] = newShippingAddress

    await rawUserInfo.save()

    const addresses = JSON.parse(JSON.stringify(rawUserInfo.address))

    addresses.forEach((address) =>
    {
      if(address.coordinate != null && (address.coordinate.lng == undefined && address.coordinate.lat == undefined))
      {
        address.coordinate = null
      }
    })
  
    return addresses
  },

  async deleteShippingAddress(userId, documentId)
  {
    const rawUserInfo = await User.findById(userId)
    if(rawUserInfo == null)
    {
      return null
    }
    if(rawUserInfo.address.length == 0)
    {
      return rawUserInfo.address
    }

    let targetIndex = -1

    for(let i = 0; i < rawUserInfo.address.length; i++)
    {
      const itemId = rawUserInfo.address[i]._id.toString()
      if(itemId == documentId)
      {
        targetIndex = i
        break
      }
    }

    if(targetIndex == -1)
    {
      return null
    }

    let newAddress = rawUserInfo.address.slice(0, targetIndex)
    newAddress = newAddress.concat(rawUserInfo.address.slice(targetIndex + 1, rawUserInfo.address.length))    

    rawUserInfo.address = newAddress

    await rawUserInfo.save()

    const addresses = JSON.parse(JSON.stringify(rawUserInfo.address))

    addresses.forEach((address) =>
    {
      if(address.coordinate != null && (address.coordinate.lng == undefined && address.coordinate.lat == undefined))
      {
        address.coordinate = null
      }
    })
  
    return addresses
  },

  async getListOfUserInfos(userIds, useAddress = undefined)
  {
    let rawUserInfos = null

    if(useAddress == undefined)
    {
      rawUserInfos = await User.find({_id: {$in: userIds}}).select("-address")
    }
    else if(useAddress == false)
    {
      rawUserInfos = await User.find({_id: {$in: userIds}}).select("-address")
    }
    else if(useAddress == true)
    {
      rawUserInfos = await User.find({_id: {$in: userIds}})
    }
    else
    {
      return null
    }

    if(rawUserInfos == null)
    {
      return null
    }

    return rawUserInfos
  }

};

export default UserService;
