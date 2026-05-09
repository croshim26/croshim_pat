const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ai_product = sequelize.define("ai_product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  user_id: {
        type:Sequelize.INTEGER,
        allowNull:false
    },
    product_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
    
  product_type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  product_description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  colors: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  size_notes: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  additional_notes: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  pdf_path: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = ai_product;
