const Category = require('./Category');
const Product = require('./Product');
const User = require("./User");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Wishlist = require("./Wishlist");
const Notification = require("./Notification");

// This creates the categoryId column in the Products table
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// A User can have many Orders
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user'});

// An Order can have many Items
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order'});

// An OrderItem belongs to a Product
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product'});

OrderItem.belongsTo(Product, { foreignKey: 'productId' });  
Product.hasMany(OrderItem, { foreignKey: 'productId' });

// User has many wishlist items
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

// Wishlist item belongs to one product
Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// One User can have many Notifications
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { Category, Product, User, Order, OrderItem, Wishlist, Notification};