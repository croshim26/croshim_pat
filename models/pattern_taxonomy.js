const Sequelize = require("sequelize");
const sequelize = require("../util/database");

/* The AI classification is stored separately from saved_patterns so the
   generated pattern content remains independent from its taxonomy metadata. */
const PatternTaxonomy = sequelize.define("pattern_taxonomy", {
  id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
  saved_pattern_id: { type: Sequelize.INTEGER, allowNull: false, unique: true },
  formal_name_en: { type: Sequelize.STRING(255), allowNull: true },
  formal_name_ar: { type: Sequelize.STRING(255), allowNull: true },
  pattern_type: { type: Sequelize.STRING(64), allowNull: false },
  pattern_type_en: { type: Sequelize.STRING(100), allowNull: false },
  pattern_type_ar: { type: Sequelize.STRING(100), allowNull: false },
  pattern_format: { type: Sequelize.STRING(16), allowNull: false },
  pattern_format_en: { type: Sequelize.STRING(100), allowNull: false },
  pattern_format_ar: { type: Sequelize.STRING(100), allowNull: false },
  confidence: { type: Sequelize.DECIMAL(4, 3), allowNull: true },
  classifier_model: { type: Sequelize.STRING(100), allowNull: true },
  classified_at: { type: Sequelize.DATE, allowNull: false },
  created_at: { type: Sequelize.DATE, allowNull: false },
  updated_at: { type: Sequelize.DATE, allowNull: false },
}, {
  tableName: "pattern_taxonomies",
  timestamps: false,
});

module.exports = PatternTaxonomy;
