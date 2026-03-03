const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Order, OrderItem, Notification} = require("../models");
const sequelize = require("../sql");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderInfo, // Items, address, phone from frontend
  } = req.body;

  const userId = req.user.id;

  // 1. Signature Verification
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature!" });
  }

  // 2. Verified! Save to DB using your exact transaction logic
  const t = await sequelize.transaction();

  try {
    const { items, address, shipping_phone, totalAmount } = orderInfo;

    // Create Order (Matches your orderController structure)
    const order = await Order.create(
      {
        userId,
        totalAmount,
        address,
        shipping_phone,
        status: "processing", // Online paid orders usually skip 'pending'
        paymentStatus: "paid",
        paymentMethod: "razorpay",
      },
      { transaction: t },
    );

    await Notification.create(
      {
        userId: userId,
        title: "Order Placed!",
        message: `Your order #${order.id.slice(0, 8)} has been successfully placed.`,
        type: "order",
      },
      { transaction: t },
    );

    // Create Order Items
    const orderItemsData = items.map((item) => ({
      orderId: order.id,
      productId: item.productId || item.id, // Support for different ID keys
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Order placed and paid successfully!",
      orderId: order.id,
    });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ success: false, message: "DB Error", error: error.message });
  }
};

// WebHook

exports.razorpayWebhook = async (req, res) => {
  const SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Verify the authenticity of the webhook call
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(body)
    .digest("hex");

  if (signature === expectedSignature) {
    const event = req.body.event;

    // Handle the 'payment.captured' event
    if (event === "payment.captured") {
      const paymentData = req.body.payload.payment.entity;
      const orderId = paymentData.notes.order_id; // We pass this in 'notes' from frontend

      try {
        const order = await Order.findByPk(orderId);
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "processing";
          await order.save();
          console.log(`Webhook: Order ${orderId} updated to PAID`);
        }
      } catch (err) {
        console.error("Webhook DB Error:", err);
      }
    }
    return res.status(200).json({ status: "ok" });
  } else {
    return res.status(400).json({ status: "invalid signature" });
  }
};
