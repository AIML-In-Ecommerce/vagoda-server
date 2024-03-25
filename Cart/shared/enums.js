const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  SOLD_OUT: "SOLD_OUT",
  SALE: "SALE"
};

const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED"
};

const AccountType = {
  SHOP: "SHOP",
  BUYER: "BUYER",
  ADMIN: "ADMIN"
};

const OrderStatus = {
  PENDING: "PENDING",
  DELIVERING: "DELIVERING",
  SHIPPING: "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

const DiscountType = {  
  PERCENTAGE: "PERCENTAGE",
  DIRECT_PRICE: "DIRECT_PRICE"
};

export { ProductStatus, AccountStatus, AccountType };
