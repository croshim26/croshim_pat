const puppeteer = require("puppeteer-core");
const chromium  = require("@sparticuz/chromium");
const fs = require("fs");

const MAC_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
];

async function getExecutablePath() {
  if (process.platform === "darwin") {
    for (const p of MAC_CHROME_PATHS) {
      if (fs.existsSync(p)) return p;
    }
    throw new Error("Chrome not found on macOS.");
  }
  return chromium.executablePath();
}

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

function esc(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ── Build complete printable HTML ─────────────────────── */
function buildPatternHtml(pattern) {
  const name     = esc(pattern.name     || "باترن كروشيه");
  const subtitle = esc(pattern.subtitle || "");
  const emoji    = esc(pattern.emoji    || "🧶");
  const coverImg = pattern.cover_image  || null;

  let tools = [], abbrs = [], parts = [];
  try { tools = JSON.parse(pattern.tools || "[]"); } catch (_) {}
  try { abbrs = JSON.parse(pattern.abbrs || "[]"); } catch (_) {}
  try { parts = JSON.parse(pattern.parts || "[]"); } catch (_) {}

  const allAbbrs    = [...DEFAULT_ABBR, ...abbrs.filter(a => a.key)];
  const hasCoverImg = !!coverImg;
  const PER_PAGE    = 4;
  const totalPages  = Math.ceil(parts.length / PER_PAGE) + (hasCoverImg ? 2 : 1);

  const subtitleRow = subtitle
    ? `<div class="pattern-subtitle-ar">${subtitle}</div>`
    : "";

  let pages = "";

  /* ── Page 1: image cover (optional) ── */
  if (hasCoverImg) {
    pages += `
<div class="page">
  <div class="cover-header" style="flex:1;padding:52px 40px;display:flex;flex-direction:column;
       justify-content:center;align-items:center;">
    <div style="position:relative;z-index:1;text-align:center;width:100%;margin-bottom:22px;">
      <div class="brand-name" style="font-size:2rem;">croshim</div>
      <div class="brand-tagline">crochet with heart</div>
    </div>
    <img src="${coverImg}" alt=""
      style="width:260px;height:260px;object-fit:cover;border-radius:50%;
             border:5px solid rgba(255,255,255,.8);
             box-shadow:0 10px 40px rgba(155,58,82,.3);margin-bottom:22px;
             position:relative;z-index:1;">
    <div style="position:relative;z-index:1;text-align:center;">
      <div class="pattern-title-ar" style="font-size:2rem;">${name}</div>
      ${subtitleRow}
    </div>
  </div>
  <div class="dots-deco"><span></span><span></span><span></span><span></span><span></span><span></span></div>
  <div class="page-footer">
    <div><div class="footer-brand">croshim</div><div class="footer-tagline">crochet with heart</div></div>
    <div class="footer-hearts">🤍 🤍 🤍</div>
    <div class="footer-page-num">١ / ${totalPages}</div>
  </div>
</div>`;
  }

  /* ── Tools + Abbreviations page ── */
  const toolsPageNum = hasCoverImg ? 2 : 1;
  const toolRows = tools.filter(t => t.name).map(t =>
    `<tr><td>${esc(t.detail || "")}</td><td>${esc(t.name)}</td></tr>`
  ).join("") || `<tr><td colspan="2" style="color:#9e677a;text-align:center;padding:8px;">—</td></tr>`;

  const abbrItems = allAbbrs.map(a =>
    `<div class="abbr-item">
       <span class="abbr-key">${esc(a.key)}</span>
       <span class="abbr-val">${esc(a.val)}</span>
     </div>`
  ).join("");

  pages += `
<div class="page">
  <div class="cover-header">
    <div class="brand-row">
      <div><div class="brand-name">croshim</div><div class="brand-tagline">crochet with heart</div></div>
      <div class="yarn-icon">${emoji}</div>
    </div>
    <div class="pattern-title-ar">${name}</div>
    ${subtitleRow}
  </div>
  <div class="dots-deco"><span></span><span></span><span></span><span></span><span></span><span></span></div>
  <div class="page-body">
    <div class="section-pill"><span>🧶</span> الأدوات المطلوبة</div>
    <table class="tools-table">${toolRows}</table>
    <div style="height:14px;"></div>
    <div class="section-pill"><span>📋</span> الرموز والاختصارات</div>
    <div class="abbr-grid">${abbrItems}</div>
  </div>
  <div class="heart-divider"><span class="heart-center">🤍</span></div>
  <div class="page-footer">
    <div><div class="footer-brand">croshim</div><div class="footer-tagline">crochet with heart</div></div>
    <div class="footer-hearts">🤍 🤍 🤍</div>
    <div class="footer-page-num">${toolsPageNum} / ${totalPages}</div>
  </div>
</div>`;

  /* ── Pattern pages ── */
  chunk(parts, PER_PAGE).forEach((group, ci) => {
    const pageNum = ci + (hasCoverImg ? 3 : 2);
    const partsHtml = group.map(p => `
      <div class="subsection-label">${esc(p.name || "")}</div>
      <div class="code-card"><code>${esc(p.code || "")}</code></div>
      ${p.note ? `<div class="note-box"><span class="note-star">⭐</span>${esc(p.note)}</div>` : ""}
    `).join("");

    pages += `
<div class="page">
  <div class="cover-header" style="padding:18px 36px;">
    <div class="brand-row" style="margin-bottom:0;">
      <div class="brand-name" style="font-size:1.3rem;">croshim</div>
      <div style="text-align:center;flex:1;">
        <div class="pattern-title-ar" style="font-size:1.4rem;">${emoji} ${name}</div>
      </div>
      <div class="yarn-icon" style="font-size:1.8rem;">🧶</div>
    </div>
  </div>
  <div class="dots-deco"><span></span><span></span><span></span><span></span><span></span><span></span></div>
  <div class="page-body">${partsHtml}</div>
  <div class="heart-divider"><span class="heart-center">🤍</span></div>
  <div class="page-footer">
    <div><div class="footer-brand">croshim</div><div class="footer-tagline">crochet with heart</div></div>
    <div class="footer-hearts">🤍 🤍 🤍</div>
    <div class="footer-page-num">${pageNum} / ${totalPages}</div>
  </div>
</div>`;
  });

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Noto Naskh Arabic','Lato',serif;color:#5A2A38;background:#fff;}
@page{margin:0;size:A4 portrait;}

:root{
  --blush:#F4C2C2;--rose:#E8839A;--deep-rose:#C0516B;--mauve:#9B3A52;
  --soft-pink:#FAE4EA;--petal:#F9D4DC;--text-dark:#5A2A38;
  --text-mid:#8B4D60;--text-light:#B8798A;
  --code-bg:#FDF5F7;--code-border:#EEC5CF;
}

.page{
  width:210mm;height:297mm;overflow:hidden;
  page-break-after:always;
  display:flex;flex-direction:column;
  background:#fff;
}

.cover-header{
  background:linear-gradient(135deg,#F9D4DC 0%,#F0A8B8 40%,#E07A94 100%);
  padding:28px 36px 22px;position:relative;overflow:hidden;flex-shrink:0;
}
.cover-header::before{
  content:'';position:absolute;top:-55px;left:-55px;
  width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.15);
}
.cover-header::after{
  content:'';position:absolute;bottom:-36px;right:-36px;
  width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.10);
}

.brand-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;position:relative;z-index:1;}
.brand-name{font-family:'Playfair Display',serif;font-style:italic;font-size:1.7rem;color:var(--mauve);letter-spacing:2px;}
.brand-tagline{font-family:'Lato',sans-serif;font-size:.58rem;letter-spacing:4px;text-transform:uppercase;color:var(--deep-rose);margin-top:2px;}
.yarn-icon{font-size:2.2rem;}
.pattern-title-ar{font-family:'Noto Naskh Arabic',serif;font-size:1.7rem;font-weight:700;color:#fff;text-align:center;text-shadow:0 2px 10px rgba(155,58,82,.28);position:relative;z-index:1;}
.pattern-subtitle-ar{font-family:'Noto Naskh Arabic',serif;font-size:.9rem;color:rgba(255,255,255,.87);text-align:center;margin-top:4px;position:relative;z-index:1;}

.dots-deco{display:flex;gap:5px;padding:7px 18px 4px;justify-content:center;flex-shrink:0;}
.dots-deco span{width:6px;height:6px;border-radius:50%;display:inline-block;}
.dots-deco span:nth-child(1){background:var(--blush);}
.dots-deco span:nth-child(2){background:var(--rose);}
.dots-deco span:nth-child(3){background:var(--blush);}
.dots-deco span:nth-child(4){background:var(--petal);}
.dots-deco span:nth-child(5){background:var(--rose);}
.dots-deco span:nth-child(6){background:var(--blush);}

.page-body{flex:1;padding:16px 36px 18px;overflow:hidden;}

.section-pill{
  display:inline-flex;align-items:center;gap:7px;
  background:linear-gradient(135deg,var(--petal),var(--blush));
  color:var(--mauve);font-family:'Noto Naskh Arabic',serif;
  font-weight:700;font-size:.95rem;
  padding:5px 14px 5px 10px;border-radius:50px;
  margin-bottom:10px;border:1.5px solid var(--rose);
  width:100%;justify-content:flex-end;
}

.subsection-label{
  font-family:'Noto Naskh Arabic',serif;font-size:.9rem;font-weight:600;
  color:var(--deep-rose);margin:12px 0 6px;
  padding-right:10px;border-right:3px solid var(--rose);text-align:right;
}

.code-card{
  background:var(--code-bg);border:1.5px solid var(--code-border);
  border-radius:10px;padding:10px 14px;margin-bottom:8px;
  direction:ltr;text-align:left;position:relative;
}
.code-card::before{
  content:'';position:absolute;top:0;right:0;
  width:4px;height:100%;
  background:linear-gradient(180deg,var(--rose),var(--blush));
  border-radius:0 10px 10px 0;
}
.code-card code{
  font-family:'Courier New',monospace;font-size:.79rem;color:var(--text-dark);
  line-height:1.9;display:block;white-space:pre-wrap;word-break:break-word;
}

.note-box{
  background:linear-gradient(135deg,#FFF0F3,#FDE8EE);
  border:1px solid var(--blush);border-radius:9px;
  padding:8px 12px;margin:5px 0 3px;
  display:flex;align-items:flex-start;gap:7px;flex-direction:row-reverse;
  font-family:'Noto Naskh Arabic',serif;font-size:.85rem;
  color:var(--text-mid);text-align:right;
}
.note-star{font-size:.9rem;flex-shrink:0;}

.tools-table{width:100%;border-collapse:separate;border-spacing:0 4px;text-align:right;font-family:'Noto Naskh Arabic',serif;}
.tools-table td{padding:6px 12px;font-size:.83rem;}
.tools-table tr:nth-child(odd)  td{background:var(--soft-pink);}
.tools-table tr:nth-child(even) td{background:var(--petal);}
.tools-table td:last-child{border-radius:7px 0 0 7px;font-weight:600;color:var(--mauve);}
.tools-table td:first-child{border-radius:0 7px 7px 0;color:var(--text-light);font-size:.77rem;}

.abbr-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}
.abbr-item{background:var(--soft-pink);border-radius:9px;padding:6px 10px;display:flex;align-items:center;gap:8px;border:1px solid var(--code-border);}
.abbr-key{font-family:'Courier New',monospace;font-weight:bold;font-size:.79rem;color:var(--deep-rose);background:#fff;border-radius:5px;padding:2px 7px;border:1px solid var(--blush);flex-shrink:0;min-width:38px;text-align:center;}
.abbr-val{font-family:'Lato',sans-serif;font-size:.73rem;color:var(--text-mid);direction:ltr;text-align:left;}

.heart-divider{display:flex;align-items:center;gap:10px;padding:0 36px;flex-shrink:0;}
.heart-divider::before,.heart-divider::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--blush),transparent);}
.heart-center{font-size:.9rem;color:var(--rose);}

.page-footer{
  background:linear-gradient(135deg,var(--petal),var(--blush));
  padding:10px 36px;display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;margin-top:auto;
}
.footer-brand{font-family:'Playfair Display',serif;font-style:italic;font-size:.9rem;color:var(--mauve);}
.footer-tagline{font-family:'Lato',sans-serif;font-size:.55rem;letter-spacing:3px;text-transform:uppercase;color:var(--deep-rose);}
.footer-hearts{font-size:.8rem;letter-spacing:3px;}
.footer-page-num{font-family:'Lato',serif;font-size:.8rem;color:var(--text-light);}
</style>
</head>
<body>
${pages}
</body>
</html>`;
}

/* ── Render PDF via Puppeteer ──────────────────────────── */
async function generatePatternPdf(pattern) {
  const html = buildPatternHtml(pattern);
  const executablePath = await getExecutablePath();

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: process.platform === "darwin"
      ? ["--no-sandbox", "--disable-setuid-sandbox"]
      : chromium.args,
    defaultViewport: chromium.defaultViewport,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });
    const bytes = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });
    return Buffer.from(bytes);
  } finally {
    await browser.close();
  }
}

module.exports = { generatePatternPdf };
