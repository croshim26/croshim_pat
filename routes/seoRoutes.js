const express = require("express");

const { Op } = require("sequelize");

const { SavedPattern, Product } = require("../models");

const router = express.Router();

const SITE_URL = (process.env.APP_URL || "https://croshim-studio.com").replace(/\/$/, "");

/* Public, indexable pages. Anything behind a login stays out. */
const STATIC_PAGES = [
  { path: "/",          changefreq: "weekly",  priority: "1.0" },
  { path: "/feedback",  changefreq: "monthly", priority: "0.5" },
  { path: "/register",  changefreq: "monthly", priority: "0.6" },
];

const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlEntry = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `
    <lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${xmlEscape(loc)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(loc)}?lang=en"/>
  </url>`;

/* =========================================================
   GET /sitemap.xml
   Static pages + every public pattern page.
   ========================================================= */
router.get("/sitemap.xml", async (req, res) => {
  try {
    /* Only patterns their owner published are advertised — the pattern route
       answers 404 for the rest, so listing them would advertise dead URLs. */
    const publishedLinks = await Product.findAll({
      attributes: ["saved_pattern_id"],
      where: { is_pattern_published: true, saved_pattern_id: { [Op.ne]: null } },
      group: ["saved_pattern_id"],
    });
    const publishedIds = publishedLinks.map((row) => row.saved_pattern_id);

    const patterns = publishedIds.length
      ? await SavedPattern.findAll({
          attributes: ["id", "updatedAt"],
          where: { id: { [Op.in]: publishedIds } },
          order: [["updatedAt", "DESC"]],
          limit: 5000,
        })
      : [];

    const entries = [
      ...STATIC_PAGES.map((p) => urlEntry({ loc: SITE_URL + p.path, ...p })),
      ...patterns.map((p) =>
        urlEntry({
          loc: `${SITE_URL}/pattern/${p.id}`,
          lastmod: p.updatedAt,
          changefreq: "monthly",
          priority: "0.8",
        })
      ),
    ];

    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`
    );
  } catch (err) {
    console.error("sitemap error:", err);
    res.status(500).type("text/plain").send("sitemap unavailable");
  }
});

module.exports = router;
