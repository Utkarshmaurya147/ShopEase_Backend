const { Product, User, Order, OrderItem } = require("../models");
const sequelize = require("../sql");
//

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.count();
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalOrders = await Order.count();
        
        // Summing revenue (Example for MySQL/PostgreSQL)
        const revenue = await Order.sum('totalPrice');

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalUsers,
                totalOrders,
                revenue: revenue || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Analytics
exports.getAnalytics = async (req, res) => {
    try {
        // 1. Total Sales and Order Count
        const stats = await Order.findAll({
            attributes: [
                [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalRevenue"],
                [sequelize.fn("COUNT", sequelize.col("id")), "totalOrders"]
            ],
            where: { paymentStatus: 'paid' }
        });

        // 2. Top Selling Products (joining OrderItems and Product)
        const topProducts = await OrderItem.findAll({
            attributes: [
                "productId",
                [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"]
            ],
            include: [{ model: Product, as: "product", attributes: ["name"] }],
            group: ["productId", "product.id"],
            order: [[sequelize.literal("totalSold"), "DESC"]],
            limit: 5
        });

        res.json({
            success: true,
            revenue: stats[0].dataValues.totalRevenue || 0,
            orders: stats[0].dataValues.totalOrders || 0,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};