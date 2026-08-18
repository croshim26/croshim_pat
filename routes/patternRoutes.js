const express = require("express");
const router  = express.Router();

const SavedPattern = require("../models/saved_pattern");

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
router.get("/pattern/:id", async (req, res) => {
  try {
    const pattern = await SavedPattern.findByPk(req.params.id);
    if (!pattern) {
      return res.redirect("/");
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
      error_message: null,
      success_message: null,
    });
  } catch (err) {
    console.error("Pattern view error:", err);
    res.redirect("/");
  }
});


module.exports = router;
