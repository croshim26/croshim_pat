'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feedbacks', {
      id:        { type: Sequelize.INTEGER,    autoIncrement: true, primaryKey: true, allowNull: false },
      type:      { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'suggestion' },
      name:      { type: Sequelize.STRING,     allowNull: true },
      email:     { type: Sequelize.STRING,     allowNull: true },
      message:   { type: Sequelize.TEXT,       allowNull: false },
      user_id:   { type: Sequelize.INTEGER,    allowNull: true },
      createdAt: { type: Sequelize.DATE,       allowNull: false },
      updatedAt: { type: Sequelize.DATE,       allowNull: false },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feedbacks');
  },
};
