require("dotenv").config();
const { Sequelize } = require("sequelize");

const useSSL = process.env.DB_SSL === "true";
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: dbPort,
    dialect: process.env.DB_DIALECT,
    logging: false,
    ...(useSSL
      ? {
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        }
      : {}),
  }
);

module.exports = sequelize;
