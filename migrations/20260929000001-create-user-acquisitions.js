"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_acquisitions", {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "users", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
      first_source: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
      first_medium: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
      first_campaign: { type: Sequelize.STRING(200), allowNull: true },
      first_referrer_host: { type: Sequelize.STRING(255), allowNull: true },
      first_seen_at: { type: Sequelize.DATE, allowNull: false },
      last_source: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
      last_medium: { type: Sequelize.STRING(100), allowNull: false, defaultValue: "direct" },
      last_campaign: { type: Sequelize.STRING(200), allowNull: true },
      last_referrer_host: { type: Sequelize.STRING(255), allowNull: true },
      last_seen_at: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("user_acquisitions", ["first_source"]);
  },
  async down(queryInterface) { await queryInterface.dropTable("user_acquisitions"); },
};
