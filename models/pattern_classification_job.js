const Sequelize = require("sequelize");
const sequelize = require("../util/database");

// Durable queue for the Python taxonomy worker. The web request only creates
// a job; it never waits for an OpenAI response.
const PatternClassificationJob = sequelize.define("pattern_classification_job", {
  id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
  saved_pattern_id: { type: Sequelize.INTEGER, allowNull: false, unique: true },
  status: {
    type: Sequelize.ENUM("pending", "processing", "completed", "failed"),
    allowNull: false,
    defaultValue: "pending",
  },
  attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  error_message: { type: Sequelize.TEXT, allowNull: true },
  processed_at: { type: Sequelize.DATE, allowNull: true },
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, {
  tableName: "pattern_classification_jobs",
  timestamps: false,
});

module.exports = PatternClassificationJob;
