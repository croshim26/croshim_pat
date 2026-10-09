"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS pattern_classification_jobs (
        id BIGSERIAL PRIMARY KEY,
        saved_pattern_id INTEGER NOT NULL UNIQUE
          REFERENCES saved_patterns(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        attempts INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS pattern_classification_jobs_status_created_at_idx
      ON pattern_classification_jobs (status, created_at)
    `);
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query("DROP TABLE IF EXISTS pattern_classification_jobs");
  },
};
