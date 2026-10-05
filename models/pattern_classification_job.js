const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* A durable queue for AI classification. The Python worker owns processing;
   the web request only adds a pending job and returns immediately. */
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
  // Sequelize validates before PostgreSQL can apply its DEFAULT NOW(). Keep
  // matching defaults here so findOrCreate can insert a job successfully.
  created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, {
  tableName: "pattern_classification_jobs",
  timestamps: false,
});

module.exports = PatternClassificationJob;
