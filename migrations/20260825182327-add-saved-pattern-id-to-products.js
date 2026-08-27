'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'saved_pattern_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'saved_patterns', key: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('products', ['saved_pattern_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'saved_pattern_id');
  },
};