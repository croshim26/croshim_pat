const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const AppSetting = sequelize.define("app_setting", {
  key:   { type: Sequelize.STRING(64), allowNull: false, unique: true },
  value: { type: Sequelize.TEXT,       allowNull: true  },
});

module.exports = AppSetting;
