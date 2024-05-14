import User from "../models/user.model.js";

const UserService = {
  async getAll(filter, projection) {
    return await User.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await User.findById(id);
  },

  async create(objectData) {
    const newObject = new User(objectData);
    return await newObject.save();
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

    clonedAddress.push(newShippingAddress)

    rawUserInfo.address = clonedAddress

    rawUserInfo.save()

    return rawUserInfo.address;
  },

  async getShippingAddress(userId)
  {
    const rawUserInfo = await User.findById(userId)
    if(rawUserInfo == null)
    {
      return null
    }
  
    return rawUserInfo.address
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

    if(newShippingAddress.receiverName == undefined || newShippingAddress.address == undefined
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

    rawUserInfo.address[targetIndex] = newShippingAddress

    rawUserInfo.save()

    return rawUserInfo.address
  }


};

export default UserService;
