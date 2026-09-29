"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("engagement_events", {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true, allowNull: false },
      event_name: { type: Sequelize.STRING(64), allowNull: false },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "products", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      pattern_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "saved_patterns", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      visitor_id: { type: Sequelize.STRING(64), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("engagement_events", ["product_id", "event_name"]);
    await queryInterface.addIndex("engagement_events", ["pattern_id", "event_name"]);
    await queryInterface.addIndex("engagement_events", ["visitor_id", "createdAt"]);
    await queryInterface.addIndex("engagement_events", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("engagement_events");
  },
};
