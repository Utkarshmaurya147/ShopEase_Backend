const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USERNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
  },
);

async function checkDbConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database Connection Successful");
  } catch (error) {
    console.error("Failed to Connect:", error.message);
  }
}

checkDbConnection();

module.exports = sequelize;
