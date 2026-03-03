// This model acts as a "Join Table" that connects a UserId to a ProductId.

const { DataTypes } = require("sequelize");
const sequelize = require("../sql");

const WishlistModel = sequelize.define("wishlists", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'updated_at',
  },
});

module.exports = WishlistModel;
