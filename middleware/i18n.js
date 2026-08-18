const ar = require('../locales/ar.json');
const en = require('../locales/en.json');

module.exports = (req, res, next) => {
  /* ?lang=en / ?lang=ar gives each language a crawlable, shareable URL —
     the hreflang tags in partials/seo.ejs point at these. */
  const requested = req.query.lang;
  if (requested === 'ar' || requested === 'en') req.session.lang = requested;

  const lang = req.session.lang || 'ar';
  res.locals.lang = lang;
  res.locals.dir  = lang === 'en' ? 'ltr' : 'rtl';
  res.locals.t    = lang === 'en' ? en : ar;
  next();
};
