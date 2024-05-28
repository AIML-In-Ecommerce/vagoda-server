import createError from "http-errors";
import axios from "axios";
import moment from "moment";
import CryptoJS from "crypto-js";
import qs from "qs";
import OrderService from "../support/order.service.js";

const ZaloPayController = {

  greeting: (req, res, next) =>
  {
    return res.json(
      {
        message: "Welcome to payment service"
      }
    )
  },

  /**
   * method: POST
   * Sandbox	POST	https://sb-openapi.zalopay.vn/v2/create
   * Real	POST	https://openapi.zalopay.vn/v2/create
   * description: Tạo đơn hàng, thanh toán
   */
  processPaymentRequest: async (req, res, next) => {
    const { products, userId, amount, orderIds } = req.body;
    const embed_data = {
      //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
      orderIds: orderIds,
      // redirecturl: `${process.env.FRONTEND_PATH}/payment`, //khi front-end chưa lên production -> tạm comment lại
    };
    const transID = Math.floor(Math.random() * 1000000);

    const order = {
      app_id: process.env.ZALOPAY_APP_ID,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: userId,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(products),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      //khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
      //Chú ý: cần dùng public url thì Zalopay Server mới call đến được (local thì dùng ngrok)
      // callback_url: `${process.env.NGROK_SERVER_PATH}/zalopay/callback`,
      callback_url: `${process.env.BASE_PATH}:${process.env.PAYMENT_PORT}/zalopay/callback`,
      description: `Techzone - Payment for the order #${transID}`,
      bank_code: "",
    };
    console.log(order)
    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data =
      process.env.ZALOPAY_APP_ID +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;
    order.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_KEY1).toString();

    try {
      const result = await axios.post(
        process.env.ZALOPAY_ENDPOINT_CREATE,
        null,
        { params: order }
      );

      return res.status(200).json(result.data);
    } catch (error) {
      console.log(error);
    }
  },

  /**
   * method: POST
   * description: callback để Zalopay Server call đến khi thanh toán thành công.
   * Khi và chỉ khi ZaloPay đã thu tiền khách hàng thành công thì mới gọi API này để thông báo kết quả.
   */
  callback: async (req, res, next) => {
    console.log("callback zalopay")
    // zp_trans_id: Number,
    // zp_user_id: String,
    // app_trans_id: String,
    // zp_user_id: String
    // paidAt: Number | Date == app_time
    let result = {};
    let targetOrderIds = []
    let targetZpTransId = -1
    let targetUserId = ""
    let targetPaidAt = null
    let targetAppTransId
    let targetZpUserId = ""


    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = CryptoJS.HmacSHA256(
        dataStr,
        process.env.ZALOPAY_KEY2
      ).toString();
      console.log("mac =", mac);

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng ở đây
        let dataJson = JSON.parse(dataStr, process.env.ZALOPAY_KEY2);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson["app_trans_id"]
        );

        const embed_data = JSON.parse(dataJson.embed_data)
        targetOrderIds = embed_data.orderIds //list of order's id
        targetZpTransId = dataJson.zp_trans_id
        targetUserId = dataJson.app_user
        targetPaidAt = new Date(dataJson.app_time)
        targetAppTransId = dataJson.app_trans_id
        targetZpUserId = dataJson.zp_user_id

        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      console.log("lỗi:::" + ex.message);
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }

    //gọi API update order status thành PENDING => đã thanh toán xong
    await OrderService.updateWaitingPaymentStatus(targetUserId, targetOrderIds, 
      targetZpTransId, targetPaidAt, targetAppTransId, targetZpUserId)
    
    // thông báo kết quả cho ZaloPay server
    res.json(result);
  },

  /**
   * method: POST
   * Sandbox	POST	https://sb-openapi.zalopay.vn/v2/query
   * Real	POST	https://openapi.zalopay.vn/v2/query
   * description:
   * Khi user thanh toán thành công,
   * ZaloPay sẽ gọi callback (notify) tới merchant để merchant cập nhật trạng thái
   * đơn hàng Thành Công trên hệ thống. Trong thực tế callback có thể bị miss do lỗi Network timeout,
   * Merchant Service Unavailable/Internal Error...
   * nên Merchant cần hiện thực việc chủ động gọi API truy vấn trạng thái đơn hàng.
   */
  checkStatusOrder: async (req, res) => {
    const { app_trans_id } = req.body;

    let postData = {
      app_id: process.env.ZALOPAY_APP_ID,
      app_trans_id, // Input your app_trans_id
    };

    let data =
      postData.app_id +
      "|" +
      postData.app_trans_id +
      "|" +
      process.env.ZALOPAY_KEY1; // appid|app_trans_id|key1
    postData.mac = CryptoJS.HmacSHA256(
      data,
      process.env.ZALOPAY_KEY1
    ).toString();

    let postConfig = {
      method: "POST",
      url: `${process.env.ZALOPAY_ENDPOINT_QUERY}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    try {
      const result = await axios(postConfig);
      console.log(result.data);
      return res.status(200).json(result.data);
      /**
       * kết quả mẫu
        {
          "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
          "return_message": "",
          "sub_return_code": 1,
          "sub_return_message": "",
          "is_processing": false,
          "amount": 50000,
          "zp_trans_id": 240331000000175,
          "server_time": 1711857138483,
          "discount_amount": 0
        }
      */
    } catch (error) {
      console.log("lỗi");
      console.log(error);
    }
  },

  processRefundRequest: async (req, res, next) => {
    const { zp_trans_id, description, amount } = req.body;
    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

    let params = {
      app_id: process.env.ZALOPAY_APP_ID,
      m_refund_id: `${moment().format("YYMMDD")}_${process.env.ZALOPAY_APP_ID}_${uid}`,
      timestamp: timestamp, // miliseconds
      zp_trans_id: zp_trans_id,
      amount: amount,
      description: description,
    };

    // app_id|zp_trans_id|amount|description|timestamp
    let data =
      params.app_id +
      "|" +
      params.zp_trans_id +
      "|" +
      params.amount +
      "|" +
      params.description +
      "|" +
      params.timestamp;
    params.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_KEY1).toString();

    await axios
      .post(process.env.ZALOPAY_ENDPOINT_REFUND, null, { params })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  },
};

export default ZaloPayController;
