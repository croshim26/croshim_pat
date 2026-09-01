const User = require("./user");
const Product = require("./product");
const SavedPattern = require("./saved_pattern");
const AccessRequest = require("./access_request");
const Message = require("./message");

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



Product.hasMany(AccessRequest, { foreignKey: "product_id" });
AccessRequest.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(AccessRequest, {
  foreignKey: "requester_id",
  as: "sentAccessRequests",
});
AccessRequest.belongsTo(User, {
  foreignKey: "requester_id",
  as: "requester",
});

User.hasMany(AccessRequest, {
  foreignKey: "owner_id",
  as: "receivedAccessRequests",
});
AccessRequest.belongsTo(User, {
  foreignKey: "owner_id",
  as: "owner",
});

AccessRequest.hasMany(Message, {
  foreignKey: "access_request_id",
  onDelete: "CASCADE",
});
Message.belongsTo(AccessRequest, {
  foreignKey: "access_request_id",
});

User.hasMany(Message, { foreignKey: "sender_id" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

module.exports = { User, Product, SavedPattern,AccessRequest,Message };