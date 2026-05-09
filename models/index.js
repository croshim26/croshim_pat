const User = require("./user");
const Product = require("./product");
const AI_product = require("./ai_product");

User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Product,
  AI_product,
};