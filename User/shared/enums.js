const ProductStatus = {
  AVAILABLE: "AVAILABLE",
  SOLD_OUT: "SOLD_OUT",
  SALE: "SALE",
  DRAFT: "DRAFT",
  DISABLED: "DISABLED",
};

const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
};

const AccountRegisterType = 
{
  STANDARD: "STANDARD",
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK"
}

const AccountType = {
  SHOP: "SHOP",
  BUYER: "BUYER",
  ADMIN: "ADMIN",
};

const OrderStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPING: "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  DIRECT_PRICE: "DIRECT_PRICE",
};

export { ProductStatus, AccountStatus, AccountType, OrderStatus, DiscountType, AccountRegisterType };
