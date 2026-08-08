'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:                 { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      firstName:          { type: Sequelize.STRING,  allowNull: true },
      lastName:           { type: Sequelize.STRING,  allowNull: true },
      password:           { type: Sequelize.STRING,  allowNull: true },
      phone:              { type: Sequelize.STRING,  allowNull: true },
      email:              { type: Sequelize.STRING,  allowNull: true, unique: true },
      reset_token:        { type: Sequelize.STRING,  allowNull: true },
      reset_token_expiry: { type: Sequelize.DATE,    allowNull: true },
      is_admin:           { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      pattern_limit:      { type: Sequelize.INTEGER, allowNull: true,  defaultValue: null },
      country:            { type: Sequelize.STRING,  allowNull: true },
      gender:             { type: Sequelize.STRING,  allowNull: true },
      crochet_experience: { type: Sequelize.STRING,  allowNull: true },
      age:                { type: Sequelize.INTEGER, allowNull: true },
      last_login:         { type: Sequelize.DATE,    allowNull: true },
      createdAt:          { type: Sequelize.DATE,    allowNull: false },
      updatedAt:          { type: Sequelize.DATE,    allowNull: false },
    }, { ifNotExists: true });

    await queryInterface.createTable('products', {
      id:                  { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      product_name:        { type: Sequelize.STRING,  allowNull: true },
      product_description: { type: Sequelize.TEXT,    allowNull: true },
      user_id:             { type: Sequelize.INTEGER, allowNull: false },
      pdf_path:            { type: Sequelize.STRING,  allowNull: true },
      createdAt:           { type: Sequelize.DATE,    allowNull: false },
      updatedAt:           { type: Sequelize.DATE,    allowNull: false },
    }, { ifNotExists: true });

    await queryInterface.createTable('saved_patterns', {
      id:          { type: Sequelize.INTEGER,    autoIncrement: true, primaryKey: true, allowNull: false },
      name:        { type: Sequelize.STRING,     allowNull: false },
      subtitle:    { type: Sequelize.STRING,     allowNull: true },
      emoji:       { type: Sequelize.STRING(16), allowNull: true },
      cover_image: { type: Sequelize.TEXT,       allowNull: true },
      tools:       { type: Sequelize.TEXT,       allowNull: true },
      abbrs:       { type: Sequelize.TEXT,       allowNull: true },
      parts:       { type: Sequelize.TEXT,       allowNull: true },
      color_theme: { type: Sequelize.STRING(32), allowNull: true, defaultValue: 'rose' },
      created_by:  { type: Sequelize.INTEGER,    allowNull: true },
      createdAt:   { type: Sequelize.DATE,       allowNull: false },
      updatedAt:   { type: Sequelize.DATE,       allowNull: false },
    }, { ifNotExists: true });

    await queryInterface.createTable('app_settings', {
      id:        { type: Sequelize.INTEGER,    autoIncrement: true, primaryKey: true, allowNull: false },
      key:       { type: Sequelize.STRING(64), allowNull: false, unique: true },
      value:     { type: Sequelize.TEXT,       allowNull: true },
      createdAt: { type: Sequelize.DATE,       allowNull: false },
      updatedAt: { type: Sequelize.DATE,       allowNull: false },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_settings');
    await queryInterface.dropTable('saved_patterns');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('users');
  },
};
