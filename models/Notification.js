// models/NotificationModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sql");

const NotificationModel = sequelize.define("notifications", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("order", "payment", "promo", "system"),
    defaultValue: "order",
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: "is_read",
  },
}, { paranoid: true });

module.exports = NotificationModel;