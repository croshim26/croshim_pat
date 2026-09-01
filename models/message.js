// models/message.js
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  access_request_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  sender_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  read_at: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = Message;