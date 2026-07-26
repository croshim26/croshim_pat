const ar = require('../locales/ar.json');
const en = require('../locales/en.json');

module.exports = (req, res, next) => {
  const lang = req.session.lang || 'ar';
  res.locals.lang = lang;
  res.locals.dir  = lang === 'en' ? 'ltr' : 'rtl';
  res.locals.t    = lang === 'en' ? en : ar;
  next();
};
