"use strict";

module.exports = {
  async up(queryInterface) {
    // IF EXISTS makes this safe for an environment where the table was already removed.
    await queryInterface.sequelize.query("DROP TABLE IF EXISTS app_settings;");
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(64) NOT NULL UNIQUE,
        value TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
  },
};
