const User = require("./user");
const Product = require("./product");
const SavedPattern = require("./saved_pattern");

User.hasMany(Product, { foreignKey: "user_id" });
Product.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(SavedPattern, { foreignKey: "created_by", onDelete: "CASCADE", hooks: true });
SavedPattern.belongsTo(User, { foreignKey: "created_by" });

Product.belongsTo(SavedPattern, {
  foreignKey: 'saved_pattern_id',
  as: 'pattern',
});
SavedPattern.hasMany(Product, {
  foreignKey: 'saved_pattern_id',
  as: 'products',
});

module.exports = { User, Product, SavedPattern };