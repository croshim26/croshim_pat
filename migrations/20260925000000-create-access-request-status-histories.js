'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_request_status_histories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      access_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'access_requests', key: 'id' },
        onDelete: 'CASCADE',
      },
      old_status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), allowNull: true },
      new_status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), allowNull: false },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      changed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('access_request_status_histories', ['access_request_id', 'changed_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('access_request_status_histories');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_access_request_status_histories_old_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_access_request_status_histories_new_status";');
  },
};
