#Time: 17/05/2024

# **Auth service**

### Seller-register: POST /seller/register

### Seller-login: POST /seller/login

### Buyer-register: POST /buyer/register

### Buyer-login path: POST /buyer/login

# **Cart service**

### Get cart by user ID: GET /cart/user/:id

### Update cart: PUT /cart/user/:id

# **Order service**

### Get all orders: GET /buyer/orders

### Get buyer order by order ID: GET /buyer/order

# **Shop service**

### Get shops by list of ids: POST /shops

### Get shop's info: GET /shop?**shopId=**...&**useShopDetail=**...&**useDesign=**...

### Get shop's info by account Id: GET /shop/account?**accountId=**...&**useShopDetail=**...&**useDesign=**...

# **User service**

### Get user info: GET /user/info?**id=**..&**accountId=**...
Tồn tại id => lấy theo id (ưu tiên).
Tồn tại accountId => lấy theo account id.

### Update user info: PUT /user/info

### Get user's shipping address: GET /user/shipping_address?**userId=**...

### Add shipping address: POST /user/shipping_address?**userId=**...

### Update shipping address PUT /user/shipping_address?**userId=**...&**targetId=**...

### Remove shipping address DELETE /user/shipping_address?**userId=**...&**targetId=**...

# **Account service**

### Get account by email: POST /account/email