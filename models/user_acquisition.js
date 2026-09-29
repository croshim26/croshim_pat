const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* First/last touch attribution for signed-in accounts. Referrer is stored as a
   hostname only, so no search terms or URL query values are retained. */
const UserAcquisition = sequelize.define("user_acquisition", {
  id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
  user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true },
  first_source: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
  first_medium: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
  first_campaign: { type: Sequelize.STRING(200), allowNull: true },
  first_referrer_host: { type: Sequelize.STRING(255), allowNull: true },
  first_seen_at: { type: Sequelize.DATE, allowNull: false },
  last_source: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
  last_medium: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
  last_campaign: { type: Sequelize.STRING(200), allowNull: true },
  last_referrer_host: { type: Sequelize.STRING(255), allowNull: true },
  last_seen_at: { type: Sequelize.DATE, allowNull: false },
});

module.exports = UserAcquisition;
