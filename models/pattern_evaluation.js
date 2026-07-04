const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const PatternEvaluation = sequelize.define("pattern_evaluation", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  original_filename: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  ai_result: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  pdf_path: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = PatternEvaluation;
