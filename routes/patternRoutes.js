const express = require("express");
const { Op } = require("sequelize");
const router  = express.Router();

const { SavedPattern, Product, AccessRequest } = require("../models");

const DEFAULT_ABBR = [
  { key: "MR",   val: "magic ring / magic loop" },
  { key: "Ch",   val: "chain" },
  { key: "sc",   val: "single crochet" },
  { key: "inc",  val: "increase (2 sc in 1 stitch)" },
  { key: "inc+", val: "3 sc in 1 stitch" },
  { key: "dec",  val: "decrease (sc 2 together)" },
  { key: "ss",   val: "slip stitch" },
  { key: "f/o",  val: "fasten off" },
];

/* ── Public pattern view ────────────────────────────────── */
/* A pattern is readable by its owner, everyone when generally published, or
   a signed-in user whose access request for its linked product was approved.
   Everything else answers 404, so walking /pattern/1, /pattern/2, ... leaks
   nothing. */
const isPatternVisibleTo = async (pattern, req) => {
  if (req.session.userId && pattern.created_by === req.session.userId) return true;

  const published = await Product.count({
    where: { saved_pattern_id: pattern.id, is_pattern_published: true },
  });
  if (published > 0) return true;

  // A guest cannot have an approved request. For signed-in users, find every
  // product that points to this pattern, then check whether this user has an
  // approved request for any of those products.
  if (!req.session.userId) return false;

  const linkedProducts = await Product.findAll({
    attributes: ["id"],
    where: { saved_pattern_id: pattern.id },
  });
  const productIds = linkedProducts.map((product) => product.id);
  if (!productIds.length) return false;

  const approved = await AccessRequest.count({
    where: {
      requester_id: req.session.userId,
      product_id: { [Op.in]: productIds },
      status: "approved",
    },
  });
  return approved > 0;
};

router.get("/pattern/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).render("404");
    }

    const pattern = await SavedPattern.findByPk(id);
    if (!pattern || !(await isPatternVisibleTo(pattern, req))) {
      return res.status(404).render("404");
    }

    // Render the read-only workbook view for everyone
    let tools = [], abbrs = [], parts = [];
    try { tools = JSON.parse(pattern.tools || "[]"); } catch (_) {}
    try { abbrs = JSON.parse(pattern.abbrs || "[]"); } catch (_) {}
    try { parts = JSON.parse(pattern.parts || "[]"); } catch (_) {}

    const allAbbrs = [...DEFAULT_ABBR, ...abbrs.filter(a => a.key)];

    /* SEO: keyword-rich title + description per pattern. Cover images stored
       as base64 data URLs are skipped — og:image needs a real URL. */
    const t = res.locals.t;
    const seoTitle = `${pattern.name} — ${t.seo_pattern_suffix} | ${t.seo_site_name}`;
    const seoDesc = [pattern.name, pattern.subtitle, t.seo_pattern_desc]
      .filter(Boolean)
      .join(" — ");
    const coverIsUrl = /^https?:\/\//.test(pattern.cover_image || "");

    res.render("pages/pattern_view", {
      pattern,
      isPatternOwner: req.session.userId === pattern.created_by,
      tools,
      parts,
      allAbbrs,
      pageTitle: seoTitle,
      seo: {
        title: seoTitle,
        description: seoDesc,
        type: "article",
        image: coverIsUrl ? pattern.cover_image : undefined,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": pattern.name,
          "headline": seoTitle,
          "description": seoDesc,
          "url": `${res.locals.siteUrl}/pattern/${pattern.id}`,
          "inLanguage": res.locals.lang === "en" ? "en" : "ar",
          "genre": "crochet pattern",
          "keywords": t.seo_keywords,
          "datePublished": pattern.createdAt,
          "dateModified": pattern.updatedAt,
          ...(coverIsUrl ? { image: pattern.cover_image } : {}),
          "publisher": { "@type": "Organization", "name": t.seo_site_name, "url": res.locals.siteUrl },
        },
      },
      error_message: res.locals.errorMessage,
      success_message: res.locals.successMessage,
    });
  } catch (err) {
    console.error("Pattern view error:", err);
    res.redirect("/");
  }
});


module.exports = router;
