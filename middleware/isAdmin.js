const User = require("../models/user");

module.exports = async (req, res, next) => {
  if (!req.session.loggedIn || !req.session.userId) {
    return res.redirect("/");
  }
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.is_admin) {
      return res.status(403).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:4rem;">
          <h1 style="color:#9b3a5a;">403 — ممنوع</h1>
          <p>ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
          <a href="/">العودة للرئيسية</a>
        </body></html>
      `);
    }
    res.locals.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
