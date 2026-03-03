const { DataTypes } = require("sequelize");
const sequelize = require("../sql");

const OrderModel = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shipping_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "shipping_phone",
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod", "razorpay"),
      allowNull: false,
      defaultValue: "cod",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid", "failed"),
      defaultValue: "unpaid",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "updated_at",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    paranoid: true,
  },
);

module.exports = OrderModel;
