const User = require("./user");
const Product = require("./product");
const AI_product = require("./ai_product");
const PatternEvaluation = require("./pattern_evaluation");

User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Product,
  AI_product,
  PatternEvaluation,
};