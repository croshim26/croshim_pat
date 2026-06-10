/**
 * pdfUnifier.js
 *
 * Strategy: NEVER extract or modify the original PDF text.
 * Instead, generate a branded Croshim Studio cover page and
 * prepend it to the original PDF using pdf-lib.
 *
 * Result:
 *   Page 1   → Croshim branded cover  (generated)
 *   Page 2…N → Original PDF pages     (byte-identical, untouched)
 *
 * Arabic text, pattern code, RTL — all perfectly preserved.
 */

const puppeteer = require("puppeteer-core");
const chromium  = require("@sparticuz/chromium");
const { PDFDocument } = require("pdf-lib");
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

/* ── Cover page HTML ──────────────────────────────────────
   Designed to match the Croshim Studio logo:
   • Soft pink background
   • "croshim" in large italic serif (Playfair Display)
   • Decorative yarn + heart + hook SVG
   • "CROCHET WITH HEART" tagline with leaf ornaments
   • Standard crochet abbreviations grid
   ─────────────────────────────────────────────────────── */
function buildCoverHtml() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Noto+Naskh+Arabic:wght@400;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

  html, body {
    width: 794px;
    height: 1123px;
    overflow: hidden;
    background: #FDF0F3;
    font-family: 'Noto Naskh Arabic', 'Lato', serif;
  }

  .page {
    width: 794px;
    height: 1123px;
    background: #FDF0F3;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Soft background blobs ── */
  .blob {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,131,154,.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .blob-tl { width:320px; height:320px; top:-80px; left:-80px; }
  .blob-br { width:280px; height:280px; bottom:-60px; right:-60px; }
  .blob-mid { width:200px; height:200px; top:42%; left:50%; transform:translateX(-50%); background:radial-gradient(circle, rgba(249,212,220,.4) 0%, transparent 70%); }

  /* ── Hero area ── */
  .hero {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 72px;
    position: relative;
    z-index: 10;
    flex: 1;
  }

  /* ── SVG illustration ── */
  .logo-art {
    width: 340px;
    height: 240px;
    margin-bottom: 18px;
    filter: drop-shadow(0 8px 24px rgba(192,81,107,.2));
  }

  /* ── Brand name ── */
  .brand-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 76px;
    font-weight: 700;
    color: #9B3A52;
    letter-spacing: -1px;
    line-height: 1;
    margin-bottom: 6px;
  }

  /* ── Ornament divider ── */
  .ornament {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 14px 0 10px;
    width: 420px;
  }
  .orn-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #E8839A, transparent);
  }
  .orn-heart {
    color: #C0516B;
    font-size: 18px;
  }
  .orn-leaf {
    color: #E8839A;
    font-size: 13px;
    opacity: .7;
  }

  /* ── Tagline ── */
  .tagline {
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #C0516B;
    margin-bottom: 48px;
  }

  /* ── Abbreviations section ── */
  .abbr-section {
    width: 680px;
    position: relative;
    z-index: 10;
  }
  .abbr-title {
    font-family: 'Noto Naskh Arabic', serif;
    font-size: 15px;
    font-weight: 700;
    color: #9B3A52;
    text-align: center;
    margin-bottom: 14px;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .abbr-title::before, .abbr-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #E8839A);
  }
  .abbr-title::after {
    background: linear-gradient(90deg, #E8839A, transparent);
  }
  .abbr-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .abbr-item {
    background: #fff;
    border: 1px solid #EEC5CF;
    border-radius: 10px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    direction: ltr;
  }
  .abbr-key {
    font-family: 'Courier New', monospace;
    font-weight: 700;
    font-size: 12px;
    color: #C0516B;
    background: #FDF5F7;
    border-radius: 6px;
    padding: 2px 7px;
    border: 1px solid #F4C2C2;
    flex-shrink: 0;
    min-width: 38px;
    text-align: center;
  }
  .abbr-val {
    font-family: 'Lato', sans-serif;
    font-size: 10px;
    color: #8B4D60;
    line-height: 1.4;
  }

  /* ── Footer strip ── */
  .cover-footer {
    width: 100%;
    background: linear-gradient(135deg, #F9D4DC, #F4C2C2);
    padding: 14px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 10;
    margin-top: auto;
  }
  .cf-brand {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 16px;
    color: #9B3A52;
  }
  .cf-hearts { font-size: 14px; letter-spacing: 5px; color: #E8839A; }
  .cf-tagline {
    font-family: 'Lato', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #C0516B;
    text-align: right;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Background blobs -->
  <div class="blob blob-tl"></div>
  <div class="blob blob-br"></div>
  <div class="blob blob-mid"></div>

  <div class="hero">

    <!-- SVG logo art — yarn ball + C-loop + heart + hook -->
    <svg class="logo-art" viewBox="0 0 340 230" fill="none" xmlns="http://www.w3.org/2000/svg">

      <!-- Yarn ball -->
      <circle cx="72" cy="148" r="52" fill="#E8839A" opacity=".9"/>
      <ellipse cx="72" cy="148" rx="52" ry="20" fill="none" stroke="white" stroke-width="1.8" opacity=".4" transform="rotate(-25 72 148)"/>
      <ellipse cx="72" cy="148" rx="52" ry="20" fill="none" stroke="white" stroke-width="1.8" opacity=".4" transform="rotate(25 72 148)"/>
      <ellipse cx="72" cy="148" rx="20" ry="52" fill="none" stroke="white" stroke-width="1.8" opacity=".4"/>
      <circle cx="72" cy="148" r="52" fill="none" stroke="#C0516B" stroke-width="1" opacity=".2"/>

      <!-- Decorative leaves (top left) -->
      <path d="M 38 78 C 28 58 10 55 7 67 C 4 78 22 85 38 78 Z" fill="#E8839A" opacity=".65"/>
      <path d="M 12 69 L 34 77" stroke="#C0516B" stroke-width="1.2" opacity=".5" stroke-linecap="round"/>
      <path d="M 28 62 C 20 46 5 44 2 53 C -1 62 14 69 28 62 Z" fill="#E8839A" opacity=".45"/>
      <path d="M 6 55 L 25 62" stroke="#C0516B" stroke-width="1" opacity=".4" stroke-linecap="round"/>
      <!-- Berries -->
      <circle cx="0"  cy="48" r="4" fill="#C0516B" opacity=".45"/>
      <circle cx="-5" cy="40" r="3" fill="#C0516B" opacity=".35"/>
      <circle cx="3"  cy="35" r="2.5" fill="#C0516B" opacity=".3"/>

      <!-- Yarn thread from ball to C-loop -->
      <path d="M 118 110 C 145 78 172 52 198 32 C 212 22 224 8 230 -8" stroke="#E8839A" stroke-width="5" stroke-linecap="round"/>

      <!-- Heart formed by yarn -->
      <path d="M 168 100 C 168 80 188 70 204 86 C 220 70 240 80 240 100 C 240 120 204 144 204 144 C 204 144 168 120 168 100 Z"
        fill="none" stroke="#C0516B" stroke-width="3.5" stroke-linejoin="round"/>

      <!-- Small floating hearts -->
      <text x="256" y="125" font-size="13" fill="#E8839A" opacity=".75">♥</text>
      <text x="148" y="60"  font-size="10" fill="#C0516B" opacity=".55">♥</text>
      <text x="260" y="70"  font-size="8"  fill="#E8839A" opacity=".5">♥</text>

      <!-- Crochet hook handle -->
      <rect x="248" y="5" width="10" height="72" rx="5" fill="#DDB8C0"/>
      <rect x="250" y="5" width="3"  height="72" rx="1.5" fill="rgba(255,255,255,.4)"/>
      <!-- Hook curve -->
      <path d="M253 77 C253 94 244 101 236 97 C228 93 230 84 238 83"
        stroke="#CFA8B2" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- Hook shine -->
      <path d="M253 77 C253 89 248 96 242 94"
        stroke="rgba(255,255,255,.35)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Hook top swirl -->
      <path d="M253 5 C253 -5 263 -9 268 -3 C273 3 268 12 259 14"
        stroke="#DDB8C0" stroke-width="2.5" fill="none" stroke-linecap="round"/>

      <!-- Yarn tail swirl -->
      <path d="M 230 142 C 241 158 236 170 225 166 C 214 162 216 152 225 150"
        stroke="#E8839A" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>

    <!-- Brand name -->
    <div class="brand-name">croshim</div>

    <!-- Ornament divider -->
    <div class="ornament">
      <div class="orn-line"></div>
      <span class="orn-leaf">🌿</span>
      <span class="orn-heart">♥</span>
      <span class="orn-leaf">🌿</span>
      <div class="orn-line"></div>
    </div>

    <!-- Tagline -->
    <div class="tagline">C R O C H E T &nbsp; W I T H &nbsp; H E A R T</div>

    <!-- Abbreviations -->
    <div class="abbr-section">
      <div class="abbr-title">الرموز والاختصارات</div>
      <div class="abbr-grid">
        <div class="abbr-item"><span class="abbr-key">MR</span><span class="abbr-val">magic ring</span></div>
        <div class="abbr-item"><span class="abbr-key">ch</span><span class="abbr-val">chain</span></div>
        <div class="abbr-item"><span class="abbr-key">sc</span><span class="abbr-val">single crochet</span></div>
        <div class="abbr-item"><span class="abbr-key">ss</span><span class="abbr-val">slip stitch</span></div>
        <div class="abbr-item"><span class="abbr-key">inc</span><span class="abbr-val">increase (2sc in 1)</span></div>
        <div class="abbr-item"><span class="abbr-key">dec</span><span class="abbr-val">decrease (2tog)</span></div>
        <div class="abbr-item"><span class="abbr-key">hdc</span><span class="abbr-val">half double crochet</span></div>
        <div class="abbr-item"><span class="abbr-key">dc</span><span class="abbr-val">double crochet</span></div>
        <div class="abbr-item"><span class="abbr-key">BLO</span><span class="abbr-val">back loop only</span></div>
        <div class="abbr-item"><span class="abbr-key">FLO</span><span class="abbr-val">front loop only</span></div>
        <div class="abbr-item"><span class="abbr-key">f/o</span><span class="abbr-val">fasten off</span></div>
        <div class="abbr-item"><span class="abbr-key">inc+</span><span class="abbr-val">3sc in 1 stitch</span></div>
      </div>
    </div>

  </div><!-- /hero -->

  <!-- Footer -->
  <div class="cover-footer">
    <div class="cf-brand">croshim</div>
    <div class="cf-hearts">🤍 &nbsp; 🤍 &nbsp; 🤍</div>
    <div class="cf-tagline">crochet with heart</div>
  </div>

</div>
</body>
</html>`;
}

/* ── Generate cover page PDF bytes ─────────────────────── */
async function generateCover() {
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
    await page.setContent(buildCoverHtml(), {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
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

/* ── Public API ─────────────────────────────────────────
   Prepends the branded cover page to the original PDF.
   The original pages are NEVER parsed, modified, or
   re-encoded — they are copied byte-identical by pdf-lib.
   ───────────────────────────────────────────────────── */
async function brandPattern(originalPdfBuffer) {
  // 1. Generate cover page
  const coverBytes = await generateCover();

  // 2. Load both documents
  const mergedDoc  = await PDFDocument.create();
  const coverDoc   = await PDFDocument.load(coverBytes);
  const originalDoc = await PDFDocument.load(originalPdfBuffer);

  // 3. Copy cover page first
  const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
  mergedDoc.addPage(coverPage);

  // 4. Copy ALL original pages — untouched
  const indices = originalDoc.getPageIndices();
  const origPages = await mergedDoc.copyPages(originalDoc, indices);
  origPages.forEach(p => mergedDoc.addPage(p));

  // 5. Save and return
  const merged = await mergedDoc.save();
  return Buffer.from(merged);
}

module.exports = { brandPattern };
