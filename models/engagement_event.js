const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* First-party analytics only: no IP address, user agent, or sensitive data is
   stored. visitor_id is an anonymous, random browser cookie. */
const EngagementEvent = sequelize.define("engagement_event", {
  id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
  event_name: { type: Sequelize.STRING(64), allowNull: false },
  product_id: { type: Sequelize.INTEGER, allowNull: true },
  pattern_id: { type: Sequelize.INTEGER, allowNull: true },
  user_id: { type: Sequelize.INTEGER, allowNull: true },
  visitor_id: { type: Sequelize.STRING(64), allowNull: true },
});

module.exports = EngagementEvent;
