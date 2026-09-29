const { User, Product, SavedPattern } = require("../models");
const AppSetting = require("../models/app_setting");
const Feedback = require("../models/feedback");

const locals = (req, res, extra = {}) => ({
  successMessage: res.locals.successMessage || req.flash("success")[0] || null,
  errorMessage: res.locals.errorMessage || req.flash("error")[0] || null,
  ...extra,
});

/* ── Dashboard ─────────────────────────────────────────── */
exports.getDashboard = async (req, res, next) => {
  try {
    const [userCount, productCount, savedPatternCount, latestProducts] =
      await Promise.all([
        User.count(),
        Product.count(),
        SavedPattern.count(),
        Product.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          include: [{ model: User, attributes: ["firstName", "lastName"], required: false }],
        }),
      ]);
    res.render("admin/dashboard", {
      pageTitle: "لوحة التحكم",
      userCount, productCount, savedPatternCount, latestProducts,
      ...locals(req, res),
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
    res.render("admin/users", { pageTitle: "المستخدمون", users, ...locals(req, res) });
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
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "firstName", "lastName", "email"], required: false },
        { model: SavedPattern, as: "pattern", attributes: ["id", "name", "emoji"], required: false },
      ],
    });
    res.render("admin/products", { pageTitle: "المنتجات", products, ...locals(req, res) });
  } catch (err) {
    console.error("getProducts error:", err);
    next(err);
  }
};

exports.toggleProductPublished = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      req.flash("error", "المنتج غير موجود.");
      return res.redirect("/ezshm_crochem/products");
    }
    await product.update({ is_published: !product.is_published });
    req.flash("success", product.is_published ? "تم نشر المنتج في المتجر." : "تم إخفاء المنتج من المتجر.");
  } catch (err) {
    console.error("toggleProductPublished error:", err);
    req.flash("error", "تعذر تحديث ظهور المنتج.");
  }
  return res.redirect("/ezshm_crochem/products");
};

exports.togglePatternPublished = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      req.flash("error", "المنتج غير موجود.");
      return res.redirect("/ezshm_crochem/products");
    }
    if (!product.pdf_path) {
      req.flash("error", "لا يمكن نشر ملف باترن لمنتج لا يحتوي على ملف PDF.");
      return res.redirect("/ezshm_crochem/products");
    }
    await product.update({ is_pattern_published: !product.is_pattern_published });
    req.flash("success", product.is_pattern_published ? "أصبح ملف الباترن متاحاً للجميع." : "أصبح ملف الباترن خاصاً.");
  } catch (err) {
    console.error("togglePatternPublished error:", err);
    req.flash("error", "تعذر تحديث ظهور ملف الباترن.");
  }
  return res.redirect("/ezshm_crochem/products");
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

/* ── Suggestions & Complaints ──────────────────────────── */
exports.getFeedback = async (req, res, next) => {
  try {
    const items = await Feedback.findAll({ order: [["createdAt", "DESC"]] });
    res.render("admin/feedback", { pageTitle: "الاقتراحات والشكاوى", items, ...locals(req, res) });
  } catch (err) {
    console.error("getFeedback error:", err);
    next(err);
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const entry = await Feedback.findByPk(req.params.id);
    if (entry) await entry.destroy();
    req.flash("success", "تم حذف الرسالة.");
  } catch (err) {
    console.error("deleteFeedback error:", err);
    req.flash("error", "حدث خطأ أثناء الحذف.");
  }
  res.redirect("/ezshm_crochem/feedback");
};

/* ── Saved Patterns ────────────────────────────────────── */
exports.getSavedPatternsPage = async (req, res, next) => {
  try {
    const savedPatterns = await SavedPattern.findAll({
      attributes: ["id", "name", "emoji", "subtitle", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.render("admin/saved_patterns", { pageTitle: "الباترنات المحفوظة", savedPatterns, ...locals(req, res) });
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
    res.render("admin/pattern_builder", { pageTitle: "Pattern Builder", savedPatterns, ...locals(req, res) });
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
