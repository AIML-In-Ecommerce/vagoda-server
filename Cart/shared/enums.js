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

const PromotionStatus = {
  UPCOMMING: "UPCOMMING",
  IN_PROGRESS: "IN_PROGRESS",
  EXPIRED: "EXPIRED"
}

export { ProductStatus, AccountStatus, AccountType };
