const { v4: uuidv4 } = require("uuid");
const Anthropic = require("@anthropic-ai/sdk");
const { User, AI_product } = require("../models");
const supabase = require("../util/supabase");
const { generatePatternPdf } = require("../util/pdfGenerator");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PATTERN_SYSTEM_PROMPT = `You are an expert professional crochet pattern designer with 20+ years of experience publishing patterns for all skill levels. Your job is to create complete, clear, and ready-to-use crochet patterns.

When given a pattern request, always generate a fully structured pattern using these sections with Markdown headers:

## 🧶 المواد المطلوبة (Materials)
- Yarn: type, weight category (fingering / DK / worsted / bulky), estimated amount in grams and meters
- Hook size in mm and its US/UK equivalent
- Additional supplies: stitch markers, tapestry needle, scissors, etc.

## 📐 الكثافة (Gauge)
Stitches × rows = 10 cm × 10 cm (state the hook size and yarn weight used for the gauge swatch)

## 📏 المقاسات النهائية (Finished Measurements)
All relevant finished dimensions for the item

## 📋 الاختصارات (Abbreviations)
List every abbreviation used — Arabic name AND standard English abbreviation in parentheses. Example:
- غ.ع = غرزة عادية (sc = single crochet)
- غ.م = غرزة مزدوجة (dc = double crochet)
- س = سلسلة (ch = chain)
- د = دورة (R = round)

## ✨ غرز خاصة (Special Stitches)
Include only if non-standard stitches are used. Otherwise omit this section.

## 🪡 التعليمات خطوة بخطوة (Step-by-Step Instructions)
Write detailed instructions:
- Label rounds as دورة R1, R2… or rows as صف Row 1, Row 2…
- End every round/row with the total stitch count in brackets [XX sts]
- Describe increases and decreases with exact technique (sc2tog, magic ring, etc.)
- Be precise — vague instructions are not acceptable

## 🔗 التجميع والإنهاء (Assembly & Finishing)
How to join pieces, weave in ends, block the finished item, and add any embellishments

## 💡 نصائح واقتراحات (Tips & Notes)
Recommended skill level, yarn substitution tips, and how to adjust sizing

---
CRITICAL RULES:
- Respond ENTIRELY in the same language the customer used in their description (Arabic request → full Arabic response; English request → full English response)
- All stitch counts must be mathematically correct — double-check your numbers
- If the request is ambiguous, make professional assumptions and briefly note them in the Tips section
- Generate realistic, wearable/usable patterns appropriate for the described item`;

/* =========================================================
   GET /request_pattern
   ========================================================= */
exports.getRequestPattern = (req, res) => {
  res.render("pages/request_pattern", {
    pageTitle: "طلب باترن بالذكاء الاصطناعي",
    error_message: req.flash("error")[0] || null,
    success_message: req.flash("success")[0] || null,
  });
};

/* =========================================================
   POST /api/generate_pattern
   Generate pattern with Claude, convert to PDF, store in Supabase.
   ========================================================= */
exports.generatePattern = async (req, res) => {
  try {
    const userId = req.session.userId;

    const {
      product_name,
      product_type,
      product_description,
      colors,
      size_notes,
      additional_notes,
    } = req.body;

    if (!product_name || !product_type || !product_description) {
      return res
        .status(400)
        .json({ error: "يرجى تعبئة جميع الحقول الإلزامية." });
    }

    const parts = [
      `نوع المنتج: ${product_type}`,
      `الوصف والتفاصيل: ${product_description.trim()}`,
    ];
    if (colors && colors.trim())
      parts.push(`الألوان المفضلة: ${colors.trim()}`);
    if (size_notes && size_notes.trim())
      parts.push(`المقاس أو الأبعاد المطلوبة: ${size_notes.trim()}`);
    if (additional_notes && additional_notes.trim())
      parts.push(`ملاحظات إضافية من العميل: ${additional_notes.trim()}`);

    const userPrompt = `قم بإنشاء باترن كروشيه كامل واحترافي بناءً على الطلب التالي:\n\n${parts.join("\n")}`;

    // 1. Generate pattern text with Claude
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 3000,
      system: [
        {
          type: "text",
          text: PATTERN_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const generatedPattern = response.content[0].text;

    // 2. Convert pattern to PDF and upload to Supabase
    let pdfUrl = null;
    try {
      const pdfBuffer = await generatePatternPdf(
        product_name.trim(),
        generatedPattern
      );

      const storageKey = `ai-patterns/${userId}/${uuidv4()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(storageKey, pdfBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .getPublicUrl(storageKey);
        pdfUrl = publicUrlData.publicUrl;
      } else {
        console.error("PDF upload error:", uploadError);
      }
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }

    // 3. Save to DB (with or without pdf_path)
    await AI_product.create({
      user_id: userId,
      product_name: product_name.trim(),
      product_type: product_type.trim(),
      product_description: product_description.trim(),
      colors: colors ? colors.trim() : null,
      size_notes: size_notes ? size_notes.trim() : null,
      additional_notes: additional_notes ? additional_notes.trim() : null,
      pdf_path: pdfUrl,
    });

    return res.json({ pattern: generatedPattern, pdf_url: pdfUrl });
  } catch (err) {
    console.error("Generate pattern error:", err);
    return res
      .status(500)
      .json({ error: "حدث خطأ أثناء إنشاء الباترن. يرجى المحاولة مجدداً." });
  }
};

/* =========================================================
   GET /ai_product
   Show the logged-in user's AI-generated patterns.
   ========================================================= */
exports.getAiProducts = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      req.flash("error", "يرجى تسجيل الدخول أولاً.");
      return res.redirect("/");
    }

    const currentUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName"],
    });

    if (!currentUser) {
      req.flash("error", "انتهت الجلسة. يرجى تسجيل الدخول مجدداً.");
      return res.redirect("/");
    }

    const ai_products = await AI_product.findAll({
      attributes: [
        "id",
        "user_id",
        "product_name",
        "product_type",
        "product_description",
        "colors",
        "size_notes",
        "additional_notes",
        "pdf_path",
        "createdAt",
      ],
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.render("pages/ai_dashboard", {
      ai_products,
      currentUser,
      success_message: req.flash("success")[0] || null,
      error_message: req.flash("error")[0] || null,
    });
  } catch (error) {
    console.error("getAiProducts error:", error);
    return next(error);
  }
};
