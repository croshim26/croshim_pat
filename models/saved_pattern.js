const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const SavedPattern = sequelize.define('saved_pattern', {
  id:          { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
  name:        { type: Sequelize.STRING,  allowNull: false },
  subtitle:    { type: Sequelize.STRING,  allowNull: true },
  emoji:       { type: Sequelize.STRING(16), allowNull: true },
  cover_image: { type: Sequelize.TEXT('long'), allowNull: true },
  tools:       { type: Sequelize.TEXT('long'), allowNull: true },
  abbrs:       { type: Sequelize.TEXT('long'), allowNull: true },
  parts:       { type: Sequelize.TEXT('long'), allowNull: true },
  created_by:  { type: Sequelize.INTEGER, allowNull: true },
});

module.exports = SavedPattern;
