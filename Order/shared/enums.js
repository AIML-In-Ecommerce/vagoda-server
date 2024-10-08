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
  WAITING_ONLINE_PAYMENT: "WAITING_ONLINE_PAYMENT", // đối với đơn hàng thanh toán trực tuyến như ZaloPay, đơn hàng đang đợi được thanh toán trước (giống Shopee)
  PENDING: "PENDING", // đơn hàng đang chờ xác nhận bởi người bán
  PROCESSING: "PROCESSING", // người bán đã xác nhận đơn hàng => chờ lấy hàng
  SHIPPING: "SHIPPING", // đã chuẩn bị hàng xong và đã giao cho đơn vị vận chuyển
  COMPLETED: "COMPLETED", // giao hàng thành công
  CANCELLED: "CANCELLED",
};

const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  DIRECT_PRICE: "DIRECT_PRICE",
};

const PaymentMethod = 
{
  COD: "COD",
  ZALOPAY: "ZALOPAY"
}

const PromotionStatus = {
  UPCOMMING: "UPCOMMING",
  IN_PROGRESS: "IN_PROGRESS",
  EXPIRED: "EXPIRED"
}


export { ProductStatus, AccountStatus, AccountType, OrderStatus, DiscountType, PaymentMethod,
  PromotionStatus
 };
