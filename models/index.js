const User = require("./user");
const Product = require("./product");
const SavedPattern = require("./saved_pattern");

User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(SavedPattern, { foreignKey: "created_by", onDelete: "CASCADE", hooks: true });
SavedPattern.belongsTo(User, { foreignKey: "created_by" });

module.exports = { User, Product, SavedPattern };