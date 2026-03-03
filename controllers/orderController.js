const { Order, OrderItem, Product, User, Notification } = require("../models");
const sequelize = require("../sql");
const {protect} = require("../middlewares/authMiddleware");
const { sendOrderEmail } = require("../utils/emailService");
const {Op} = require("sequelize");

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { items, address, shipping_phone } = req.body;
    const userId = req.user.id; // from protect middleware

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }

    // Validate phone existence
    if (!shipping_phone) {
      return res
        .status(400)
        .json({ message: "Phone number is required for delivery. Update from Personal Information." });
    }

    // Calculate Total Amount
    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    // Create the main order with shippingPhone
    const order = await Order.create(
      {
        userId,
        totalAmount,
        address,
        shipping_phone,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "cod",
      },
      {
        transaction: t,
      },
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
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    await t.commit();

    await sendOrderEmail(req.user.email, order, Product);
    console.log("Confirmation email sent to:", req.user.email);

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: order.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
};

// Get My Order
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id; // from protect middleware

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "image"], // Only get what the UI needs
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]], // Newest Order First
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

// Get Order Details
const getOrderDetails = async (req, res) => {
  try {
    // Log exactly what the backend sees to your terminal
    console.log("Full Params Object:", req.params);

    // 2. Extract the value safely.
    // If your route is /details/:id, use req.params.id
    // If your route is /details/:orderId, use req.params.orderId
    const orderId = req.params.id || req.params.orderId;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "No ID provided" });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    if (!order || order.userId != req.user.id) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Sequelize Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id; // from protect middleware

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Cancellation failed", error: error.message });
  }
};


// Get ALL Orders (For Admin)
const getAllOrders = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const {status, search} = req.query;

    let andConditions = [];
    if (status) {
      andConditions.push({ status: status });
    }

    if (search) {
      andConditions.push({
        [Op.or]: [
          { id: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
          { "$user.name$": { [Op.like]: `%${search}%` } },
          { "$user.email$": { [Op.like]: `%${search}%` } }
        ],
      });
    }
    // Combine conditions into the final where clause
    const whereCondition = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

    const {count, rows} = await Order.findAndCountAll({
      where: whereCondition,
      include: [  
        {
          model: User, // Include User to see who bought it
          as: "user",
          attributes: ["name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product",
              attributes: ["name", "image"],
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
      distinct: true,   // Prevents incorrect count when using includes
      subQuery: false,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      orders: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Admin Fetch Error", error: error.message });
  }
};


// Update Order Details
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus, paymentMethod } = req.body;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update fields only if they are present in the request
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      updatedFields: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Update failed", 
      error: error.message 
    });
  }
};


module.exports = { createOrder, getMyOrders, cancelOrder, getOrderDetails, getAllOrders, updateOrderStatus};
