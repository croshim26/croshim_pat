const puppeteer = require("puppeteer");
const { marked } = require("marked");

async function generatePatternPdf(title, markdownText) {
  const htmlContent = marked.parse(markdownText);

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Arial Unicode MS', Tahoma, Arial, sans-serif;
      padding: 50px;
      direction: rtl;
      line-height: 1.9;
      color: #2d2d2d;
      font-size: 13px;
    }
    .doc-header {
      text-align: center;
      border-bottom: 3px solid #c97c5d;
      padding-bottom: 20px;
      margin-bottom: 35px;
    }
    .doc-header h1 {
      color: #c97c5d;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .doc-header p { color: #999; font-size: 11px; }
    h2 {
      color: #c97c5d;
      font-size: 15px;
      font-weight: 700;
      border-bottom: 1.5px solid #f0ede9;
      padding-bottom: 6px;
      margin: 28px 0 12px;
    }
    h3 { color: #4a3728; font-size: 13px; font-weight: 700; margin: 16px 0 8px; }
    p { margin-bottom: 8px; }
    ul, ol { padding-right: 22px; padding-left: 0; margin-bottom: 12px; }
    li { margin-bottom: 5px; }
    strong { color: #4a3728; }
    hr { border: none; border-top: 1px dashed #e0dbd5; margin: 22px 0; }
    .doc-footer {
      text-align: center;
      color: #bbb;
      font-size: 10px;
      border-top: 1px solid #f0ede9;
      padding-top: 15px;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <h1>🧶 ${title}</h1>
    <p>Crochet Hub — باترن منشأ بالذكاء الاصطناعي · ${new Date().toLocaleDateString("ar-SA")}</p>
  </div>
  ${htmlContent}
  <div class="doc-footer">تم إنشاء هذا الباترن بواسطة Crochet Hub AI</div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15px", right: "15px", bottom: "15px", left: "15px" },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePatternPdf };
