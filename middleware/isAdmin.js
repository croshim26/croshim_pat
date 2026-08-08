const User = require("../models/user");

module.exports = async (req, res, next) => {
  if (!req.session.loggedIn || !req.session.userId) {
    return res.redirect("/");
  }
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.is_admin) {
      return res.status(403).render("403");
    }
    res.locals.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
