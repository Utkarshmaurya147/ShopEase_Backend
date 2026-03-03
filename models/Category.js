const {DataTypes} = require("sequelize");
const sequelize = require("../sql");

const CategoryModel = sequelize.define("categories", {
    id: {
        type :DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
      allowNull: true,
    },
    deletedAt: {    
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
},{
    tableName: "categories",
    timestamps: true,   
    paranoid: true
});

module.exports = CategoryModel;