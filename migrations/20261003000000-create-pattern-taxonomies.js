"use strict";

module.exports = {
  async up(queryInterface) {
    // IF NOT EXISTS keeps this migration safe when the notebook has already
    // created the table in a local database.
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS pattern_taxonomies (
        id BIGSERIAL PRIMARY KEY,
        saved_pattern_id INTEGER NOT NULL UNIQUE REFERENCES saved_patterns(id) ON DELETE CASCADE,
        pattern_type VARCHAR(64) NOT NULL,
        pattern_type_en VARCHAR(100) NOT NULL,
        pattern_type_ar VARCHAR(100) NOT NULL,
        pattern_format VARCHAR(16) NOT NULL,
        pattern_format_en VARCHAR(100) NOT NULL,
        pattern_format_ar VARCHAR(100) NOT NULL,
        formal_name_en VARCHAR(255) NOT NULL,
        formal_name_ar VARCHAR(255) NOT NULL,
        confidence NUMERIC(4,3),
        classifier_model VARCHAR(100),
        classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query("DROP TABLE IF EXISTS pattern_taxonomies");
  },
};