// models/access_request_status_history.js
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const AccessRequestStatusHistory = sequelize.define(
  "access_request_status_history",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    access_request_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    old_status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: true, // null when the request is created
    },

    new_status: {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
    },

    changed_by: {
      type: Sequelize.INTEGER,
      allowNull: false, // User ID who made the change
    },

    changed_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }
);

module.exports = AccessRequestStatusHistory;