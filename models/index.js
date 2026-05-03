const User = require("./user");
const Product = require("./product");

User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  User,
  Product,
};