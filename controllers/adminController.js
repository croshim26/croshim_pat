const path = require("path");
const fs   = require("fs");

const User = require("../models/user");
const Product = require("../models/product");
const AiProduct = require("../models/ai_product");
const PatternEvaluation = require("../models/pattern_evaluation");
const SavedPattern = require("../models/saved_pattern");
const AppSetting = require("../models/app_setting");
const { generatePatternPdf } = require("../util/patternPdfGenerator");
const igApi = require("../util/instagramApi");

const locals = (req, extra = {}) => ({
  successMessage: req.flash("success")[0] || null,
  errorMessage: req.flash("error")[0] || null,
  ...extra,
});

/* ── Dashboard ─────────────────────────────────────────── */
exports.getDashboard = async (req, res) => {
  const [userCount, productCount, aiProductCount, evaluationCount, savedPatternCount] =
    await Promise.all([
      User.count(),
      Product.count(),
      AiProduct.count(),
      PatternEvaluation.count(),
      SavedPattern.count(),
    ]);

  res.render("admin/dashboard", {
    pageTitle: "لوحة التحكم",
    userCount,
    productCount,
    aiProductCount,
    evaluationCount,
    savedPatternCount,
    ...locals(req),
  });
};

/* ── Users ─────────────────────────────────────────────── */
exports.getUsers = async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/users", {
    pageTitle: "المستخدمون",
    users,
    ...locals(req),
  });
};

exports.toggleAdmin = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    req.flash("error", "المستخدم غير موجود.");
    return res.redirect("/ezshm_crochem/users");
  }
  if (user.id === req.session.userId) {
    req.flash("error", "لا يمكنك تغيير صلاحياتك بنفسك.");
    return res.redirect("/ezshm_crochem/users");
  }
  user.is_admin = !user.is_admin;
  await user.save();
  req.flash("success", `تم تحديث صلاحيات ${user.email}.`);
  res.redirect("/ezshm_crochem/users");
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    req.flash("error", "المستخدم غير موجود.");
    return res.redirect("/ezshm_crochem/users");
  }
  if (user.id === req.session.userId) {
    req.flash("error", "لا يمكنك حذف حسابك الخاص.");
    return res.redirect("/ezshm_crochem/users");
  }
  await user.destroy();
  req.flash("success", "تم حذف المستخدم.");
  res.redirect("/ezshm_crochem/users");
};

/* ── Products ──────────────────────────────────────────── */
exports.getProducts = async (req, res) => {
  const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
  res.render("admin/products", {
    pageTitle: "المنتجات",
    products,
    ...locals(req),
  });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) await product.destroy();
  req.flash("success", "تم حذف المنتج.");
  res.redirect("/ezshm_crochem/products");
};

/* ── AI Patterns ───────────────────────────────────────── */
exports.getAiPatterns = async (req, res) => {
  const patterns = await AiProduct.findAll({
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/ai_patterns", {
    pageTitle: "باترنات الذكاء الاصطناعي",
    patterns,
    ...locals(req),
  });
};

exports.deleteAiPattern = async (req, res) => {
  const pattern = await AiProduct.findByPk(req.params.id);
  if (pattern) await pattern.destroy();
  req.flash("success", "تم حذف الباترن.");
  res.redirect("/ezshm_crochem/ai-patterns");
};

/* ── Evaluations ───────────────────────────────────────── */
exports.getEvaluations = async (req, res) => {
  const evaluations = await PatternEvaluation.findAll({
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/evaluations", {
    pageTitle: "التقييمات",
    evaluations,
    ...locals(req),
  });
};

exports.deleteEvaluation = async (req, res) => {
  const ev = await PatternEvaluation.findByPk(req.params.id);
  if (ev) await ev.destroy();
  req.flash("success", "تم حذف التقييم.");
  res.redirect("/ezshm_crochem/evaluations");
};

/* ── Saved Patterns List ────────────────────────────────── */
exports.getSavedPatternsPage = async (req, res) => {
  const savedPatterns = await SavedPattern.findAll({
    attributes: ["id", "name", "emoji", "subtitle", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/saved_patterns", {
    pageTitle: "الباترنات المحفوظة",
    savedPatterns,
    ...locals(req),
  });
};

exports.deleteSavedPatternFromList = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (pattern) await pattern.destroy();
    req.flash("success", "تم حذف الباترن.");
  } catch (err) {
    console.error("Delete pattern error:", err);
    req.flash("error", "خطأ أثناء الحذف.");
  }
  res.redirect("/ezshm_crochem/saved-patterns");
};

/* ── Pattern Builder ───────────────────────────────────── */
exports.getPatternBuilder = async (req, res) => {
  const savedPatterns = await SavedPattern.findAll({
    attributes: ["id", "name", "emoji", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  res.render("admin/pattern_builder", {
    pageTitle: "Pattern Builder",
    savedPatterns,
    ...locals(req),
  });
};

exports.savePattern = async (req, res) => {
  try {
    const { id, name, subtitle, emoji, cover_image, tools, abbrs, parts } = req.body;

    let pattern;
    if (id) {
      pattern = await SavedPattern.findByPk(id);
      if (pattern) {
        await pattern.update({ name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts });
      }
    }

    if (!pattern) {
      pattern = await SavedPattern.create({
        name: name || "باترن جديد",
        subtitle,
        emoji,
        cover_image,
        tools,
        abbrs,
        parts,
        created_by: req.session.userId,
      });
    }

    res.json({ success: true, pattern });
  } catch (err) {
    console.error("Save pattern error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.loadPattern = async (req, res) => {
  const pattern = await SavedPattern.findByPk(req.params.id);
  if (!pattern) return res.status(404).json({ error: "not found" });
  res.json(pattern);
};

exports.deletePattern = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (pattern) await pattern.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete pattern error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.downloadPatternPdf = async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (!pattern) {
      req.flash("error", "الباترن غير موجود.");
      return res.redirect("/ezshm_crochem/pattern-builder");
    }

    const pdfBuffer = await generatePatternPdf(pattern);
    const safeName  = (pattern.name || "pattern").replace(/[^؀-ۿa-zA-Z0-9 _-]/g, "").trim() || "pattern";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''croshim-${encodeURIComponent(safeName)}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Pattern PDF error:", err);
    req.flash("error", "خطأ في توليد الـ PDF. تأكد من تثبيت Chrome.");
    res.redirect("/ezshm_crochem/pattern-builder");
  }
};

/* ══════════════════════════════════════════════════════════
   INSTAGRAM
══════════════════════════════════════════════════════════ */

const IG_ENV_MAP = {
  ig_user_id:     process.env.IG_USER_ID,
  ig_access_token: process.env.IG_ACCESS_TOKEN,
  ig_base_url:    process.env.IG_BASE_URL,
};

async function getSetting(key) {
  const row = await AppSetting.findOne({ where: { key } });
  if (row && row.value) return row.value;
  return IG_ENV_MAP[key] || null;
}
async function setSetting(key, value) {
  await AppSetting.upsert({ key, value });
}

exports.getInstagramPage = async (req, res) => {
  const igUserId      = await getSetting("ig_user_id");
  const accessToken   = await getSetting("ig_access_token");
  const baseUrl       = await getSetting("ig_base_url") || "";

  let account = null;
  let tokenError = null;

  if (igUserId && accessToken) {
    try {
      account = await igApi.verifyAccount(igUserId, accessToken);
    } catch (err) {
      tokenError = err.message;
    }
  }

  res.render("admin/instagram", {
    pageTitle: "إنستغرام",
    igUserId:    igUserId    || "",
    accessToken: accessToken ? "••••••••" + accessToken.slice(-6) : "",
    baseUrl,
    account,
    tokenError,
    isConnected: !!account,
    ...locals(req),
  });
};

exports.saveInstagramSettings = async (req, res) => {
  const { ig_user_id, access_token, base_url } = req.body;

  if (!ig_user_id || !access_token) {
    req.flash("error", "يرجى إدخال IG User ID و Access Token.");
    return res.redirect("/ezshm_crochem/instagram");
  }

  try {
    await igApi.verifyAccount(ig_user_id, access_token);
  } catch (err) {
    req.flash("error", `فشل التحقق من الحساب: ${err.message}`);
    return res.redirect("/ezshm_crochem/instagram");
  }

  await setSetting("ig_user_id",      ig_user_id.trim());
  await setSetting("ig_access_token", access_token.trim());
  await setSetting("ig_base_url",     (base_url || "").trim());

  req.flash("success", "تم حفظ إعدادات إنستغرام وتم التحقق من الحساب بنجاح ✓");
  res.redirect("/ezshm_crochem/instagram");
};

exports.refreshInstagramToken = async (req, res) => {
  const accessToken = await getSetting("ig_access_token");
  if (!accessToken) {
    req.flash("error", "لا يوجد token محفوظ.");
    return res.redirect("/ezshm_crochem/instagram");
  }
  try {
    const result = await igApi.refreshToken(accessToken);
    await setSetting("ig_access_token", result.access_token);
    req.flash("success", "تم تجديد الـ Token بنجاح — صالح 60 يوماً إضافية ✓");
  } catch (err) {
    req.flash("error", `خطأ في تجديد الـ Token: ${err.message}`);
  }
  res.redirect("/ezshm_crochem/instagram");
};

exports.postInstagram = async (req, res) => {
  const igUserId    = await getSetting("ig_user_id");
  const accessToken = await getSetting("ig_access_token");
  let   baseUrl     = await getSetting("ig_base_url") || "";

  if (!igUserId || !accessToken) {
    req.flash("error", "الحساب غير متصل. أضف إعدادات إنستغرام أولاً.");
    return res.redirect("/ezshm_crochem/instagram");
  }

  if (!req.file) {
    req.flash("error", "يرجى اختيار صورة للمنشور.");
    return res.redirect("/ezshm_crochem/instagram");
  }

  const { caption = "" } = req.body;

  // Derive base URL from request if not configured
  if (!baseUrl) {
    baseUrl = `${req.protocol}://${req.get("host")}`;
  }

  if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
    req.flash("error", "لا يمكن النشر من localhost — Instagram يحتاج URL عام. أضف الـ Base URL في الإعدادات.");
    return res.redirect("/ezshm_crochem/instagram");
  }

  // Save image to public folder
  const uploadsDir = path.join(__dirname, "..", "public", "uploads", "ig");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const ext      = (req.file.originalname.match(/\.(jpe?g|png|webp)$/i) || [".jpg"])[0];
  const filename = `ig_${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, req.file.buffer);

  const imageUrl = `${baseUrl}/uploads/ig/${filename}`;

  try {
    await igApi.publishPhoto(igUserId, accessToken, imageUrl, caption);
    req.flash("success", "تم نشر المنشور على إنستغرام بنجاح! 🎉");
  } catch (err) {
    console.error("Instagram post error:", err);
    // Clean up saved image on failure
    fs.unlink(filepath, () => {});
    req.flash("error", `فشل النشر: ${err.message}`);
  }

  res.redirect("/ezshm_crochem/instagram");
};
