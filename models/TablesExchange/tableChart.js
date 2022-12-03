const sequelize = require("../../db");
const { DataTypes } = require("sequelize");


const Chart = sequelize.define("chart", {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.BIGINT, allowNull: false },
    high: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    low: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    open: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    close: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    volume: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    quoteVolume: { type: DataTypes.DECIMAL(61,8), allowNull: false },
    weightedAverage: { type: DataTypes.DECIMAL(61,8), allowNull: false },
  });

  module.exports = {
    Chart
  }