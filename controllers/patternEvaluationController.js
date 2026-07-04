const { v4: uuidv4 } = require("uuid");
const Anthropic = require("@anthropic-ai/sdk");
const { User, PatternEvaluation } = require("../models");
const supabase = require("../util/supabase");
const { generatePatternPdf } = require("../util/pdfGenerator");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EVAL_PROMPT = `أنت محرر ومصمم باترنات كروشيه محترف. ستتلقى ملف PDF يحتوي على باترن كروشيه.

مهمتك تتكون من جزأين:

**الجزء الأول — التقييم:**
اقرأ الباترن بعناية وقيّمه بشكل منظم. حدد:
- ما هو المنتج ومستوى الصعوبة المناسب له
- نقاط القوة في الباترن
- المشكلات: معلومات ناقصة، خطوات غير واضحة، أخطاء في عدد الغرز، اختصارات مفقودة، تنسيق ضعيف
- تقييم عام للجودة (ممتاز / جيد / يحتاج تحسين / ضعيف)

**الجزء الثاني — النسخة المحسّنة:**
أعد كتابة الباترن بالكامل بصيغة احترافية محسّنة. صحح جميع المشكلات المحددة. يجب أن تتضمن النسخة المحسّنة جميع الأقسام الأساسية (المواد، الكثافة، الاختصارات، التعليمات خطوة بخطوة مع عدد الغرز، الإنهاء).

نسّق ردك بالضبط كما يلي:

## 📋 تقييم الباترن الأصلي

[اكتب التقييم هنا]

---

## ✨ الباترن المحسّن

[اكتب الباترن المحسّن الكامل هنا بجميع أقسامه]

القواعد:
- رد بنفس لغة محتوى الباترن (عربي أو إنجليزي)
- يجب أن تكون جميع أعداد الغرز صحيحة رياضياً
- يجب أن يكون الباترن المحسّن كاملاً وجاهزاً للاستخدام`;

/* =========================================================
   GET /evaluate_pattern
   ========================================================= */
exports.getPage = (req, res) => {
  res.render("pages/pattern_evaluation", {
    pageTitle: "تقييم وتحسين الباترن",
    error_message: req.flash("error")[0] || null,
    success_message: req.flash("success")[0] || null,
  });
};

/* =========================================================
   POST /api/evaluate_pattern
   Receive PDF as base64, evaluate with Claude, store result.
   ========================================================= */
exports.evaluatePattern = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { pdf_base64, filename } = req.body;

    if (!pdf_base64 || !filename) {
      return res.status(400).json({ error: "يرجى رفع ملف PDF صالح." });
    }

    // Call Claude with the PDF document
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdf_base64,
              },
            },
            {
              type: "text",
              text: EVAL_PROMPT,
            },
          ],
        },
      ],
    });

    const aiResult = response.content[0].text;

    // Extract the improved pattern section for the PDF
    let improvedSection = aiResult;
    const splitIdx = aiResult.indexOf("## ✨");
    if (splitIdx !== -1) {
      improvedSection = aiResult.substring(splitIdx);
    }

    // Generate PDF of the improved pattern
    let pdfUrl = null;
    try {
      const patternTitle = "باترن محسّن: " + filename.replace(/\.pdf$/i, "");
      const pdfBuffer = await generatePatternPdf(patternTitle, improvedSection);

      const storageKey = `pattern-evaluations/${userId}/${uuidv4()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(storageKey, pdfBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .getPublicUrl(storageKey);
        pdfUrl = data.publicUrl;
      } else {
        console.error("PDF upload error:", uploadError);
      }
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }

    // Save to DB
    await PatternEvaluation.create({
      user_id: userId,
      original_filename: filename,
      ai_result: aiResult,
      pdf_path: pdfUrl,
    });

    return res.json({ result: aiResult, pdf_url: pdfUrl });
  } catch (err) {
    console.error("Evaluate pattern error:", err);
    return res
      .status(500)
      .json({ error: "حدث خطأ أثناء تقييم الباترن. يرجى المحاولة مجدداً." });
  }
};

/* =========================================================
   GET /my_evaluations
   Show the logged-in user's evaluation history.
   ========================================================= */
exports.getEvaluations = async (req, res, next) => {
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

    const evaluations = await PatternEvaluation.findAll({
      attributes: ["id", "original_filename", "pdf_path", "createdAt"],
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    return res.render("pages/my_evaluations", {
      evaluations,
      currentUser,
      success_message: req.flash("success")[0] || null,
      error_message: req.flash("error")[0] || null,
    });
  } catch (error) {
    console.error("getEvaluations error:", error);
    return next(error);
  }
};
