const User = require("../models/user");
const Product = require("../models/product");
const SavedPattern = require("../models/saved_pattern");
const AppSetting = require("../models/app_setting");

const locals = (req, extra = {}) => ({
  successMessage: req.flash("success")[0] || null,
  errorMessage: req.flash("error")[0] || null,
  ...extra,
});

/* ── Dashboard ─────────────────────────────────────────── */
exports.getDashboard = async (req, res, next) => {
  try {
    const [userCount, productCount, savedPatternCount] =
      await Promise.all([User.count(), Product.count(), SavedPattern.count()]);
    res.render("admin/dashboard", {
      pageTitle: "لوحة التحكم",
      userCount, productCount, savedPatternCount,
      ...locals(req),
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    next(err);
  }
};

/* ── Users ─────────────────────────────────────────────── */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    res.render("admin/users", { pageTitle: "المستخدمون", users, ...locals(req) });
  } catch (err) {
    console.error("getUsers error:", err);
    next(err);
  }
};

exports.toggleAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash("error", "المستخدم غير موجود."); return res.redirect("/ezshm_crochem/users"); }
    if (user.id === req.session.userId) { req.flash("error", "لا يمكنك تغيير صلاحياتك بنفسك."); return res.redirect("/ezshm_crochem/users"); }
    user.is_admin = !user.is_admin;
    await user.save();
    req.flash("success", `تم تحديث صلاحيات ${user.email}.`);
    res.redirect("/ezshm_crochem/users");
  } catch (err) {
    console.error("toggleAdmin error:", err);
    req.flash("error", "حدث خطأ أثناء تحديث الصلاحيات.");
    res.redirect("/ezshm_crochem/users");
  }
};

// exports.togglePatternBuilderAccess = async (req, res) => { ... };

exports.setPatternLimit = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash("error", "المستخدم غير موجود."); return res.redirect("/ezshm_crochem/users"); }
    const raw = parseInt(req.body.limit);
    user.pattern_limit = (isNaN(raw) || raw < 0) ? null : raw;
    await user.save();
    const display = user.pattern_limit === 0 ? 'غير محدود (∞)' : (user.pattern_limit ?? 5) + ' باترنات';
    req.flash("success", `تم تعيين حد الـ Workbook للمستخدم ${user.email} إلى ${display}.`);
    res.redirect("/ezshm_crochem/users");
  } catch (err) {
    console.error("setPatternLimit error:", err);
    req.flash("error", "حدث خطأ أثناء تحديث الحد.");
    res.redirect("/ezshm_crochem/users");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { req.flash("error", "المستخدم غير موجود."); return res.redirect("/ezshm_crochem/users"); }
    if (user.id === req.session.userId) { req.flash("error", "لا يمكنك حذف حسابك الخاص."); return res.redirect("/ezshm_crochem/users"); }
    await user.destroy();
    req.flash("success", "تم حذف المستخدم.");
    res.redirect("/ezshm_crochem/users");
  } catch (err) {
    console.error("deleteUser error:", err);
    req.flash("error", "حدث خطأ أثناء حذف المستخدم.");
    res.redirect("/ezshm_crochem/users");
  }
};

/* ── Products ──────────────────────────────────────────── */
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
    res.render("admin/products", { pageTitle: "المنتجات", products, ...locals(req) });
  } catch (err) {
    console.error("getProducts error:", err);
    next(err);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) await product.destroy();
    req.flash("success", "تم حذف المنتج.");
    res.redirect("/ezshm_crochem/products");
  } catch (err) {
    console.error("deleteProduct error:", err);
    req.flash("error", "حدث خطأ أثناء حذف المنتج.");
    res.redirect("/ezshm_crochem/products");
  }
};

/* ── Saved Patterns ────────────────────────────────────── */
exports.getSavedPatternsPage = async (req, res, next) => {
  try {
    const savedPatterns = await SavedPattern.findAll({
      attributes: ["id", "name", "emoji", "subtitle", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/saved_patterns", { pageTitle: "الباترنات المحفوظة", savedPatterns, ...locals(req) });
  } catch (err) {
    console.error("getSavedPatternsPage error:", err);
    next(err);
  }
};

exports.deleteSavedPatternFromList = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (pattern) await pattern.destroy();
    req.flash("success", "تم حذف الباترن.");
  } catch (err) {
    console.error("deleteSavedPatternFromList error:", err);
    req.flash("error", "خطأ أثناء الحذف.");
  }
  res.redirect("/ezshm_crochem/saved-patterns");
};

/* ── Admin Pattern Builder ─────────────────────────────── */
exports.getPatternBuilder = async (req, res, next) => {
  try {
    const savedPatterns = await SavedPattern.findAll({
      attributes: ["id", "name", "emoji", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/pattern_builder", { pageTitle: "Pattern Builder", savedPatterns, ...locals(req) });
  } catch (err) {
    console.error("getPatternBuilder error:", err);
    next(err);
  }
};

exports.savePattern = async (req, res) => {
  try {
    const { id, name, subtitle, emoji, cover_image, tools, abbrs, parts } = req.body;
    let pattern;
    if (id) {
      pattern = await SavedPattern.findByPk(id);
      if (pattern) await pattern.update({ name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts });
    }
    if (!pattern) {
      pattern = await SavedPattern.create({ name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts, created_by: req.session.userId });
    }
    res.json({ success: true, pattern });
  } catch (err) {
    console.error("savePattern error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.loadPattern = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (!pattern) return res.status(404).json({ error: "not found" });
    res.json(pattern);
  } catch (err) {
    console.error("loadPattern error:", err);
    res.status(500).json({ error: "server error" });
  }
};

exports.deletePattern = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (pattern) await pattern.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("deletePattern error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ══════════════════════════════════════════════════════════
   INSTAGRAM
══════════════════════════════════════════════════════════ */

const IG_ENV_MAP = {
  ig_user_id:      process.env.IG_USER_ID,
  ig_access_token: process.env.IG_ACCESS_TOKEN,
  ig_base_url:     process.env.IG_BASE_URL,
};

async function getSetting(key) {
  const row = await AppSetting.findOne({ where: { key } });
  if (row && row.value) return row.value;
  return IG_ENV_MAP[key] || null;
}
async function setSetting(key, value) {
  await AppSetting.upsert({ key, value });
}

