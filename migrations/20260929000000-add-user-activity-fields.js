"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("engagement_events", "session_id", {
      type: Sequelize.STRING(64), allowNull: true,
    });
    await queryInterface.addColumn("engagement_events", "page_path", {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn("engagement_events", "duration_seconds", {
      type: Sequelize.INTEGER, allowNull: true,
    });
    await queryInterface.addIndex("engagement_events", ["user_id", "createdAt"]);
    await queryInterface.addIndex("engagement_events", ["user_id", "session_id"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("engagement_events", ["user_id", "session_id"]);
    await queryInterface.removeIndex("engagement_events", ["user_id", "createdAt"]);
    await queryInterface.removeColumn("engagement_events", "duration_seconds");
    await queryInterface.removeColumn("engagement_events", "page_path");
    await queryInterface.removeColumn("engagement_events", "session_id");
  },
};
