const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* Suggestions and complaints sent from the public /feedback page.
   user_id is null when a visitor is not logged in. */
const Feedback = sequelize.define('feedback', {
  id:      { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
  type:    { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'suggestion' }, // suggestion | complaint
  name:    { type: Sequelize.STRING, allowNull: true },
  email:   { type: Sequelize.STRING, allowNull: true },
  message: { type: Sequelize.TEXT,   allowNull: false },
  user_id: { type: Sequelize.INTEGER, allowNull: true },
});

module.exports = Feedback;
