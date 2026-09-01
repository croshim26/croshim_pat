// models/access_request.js
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const AccessRequest = sequelize.define("access_request", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  requester_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  owner_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("pending", "approved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
  approved_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, {
    indexes: [{ unique: true, fields: ["product_id", "requester_id"] }],
  });

module.exports = AccessRequest;
