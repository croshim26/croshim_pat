const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY is not set — password reset emails will fail.");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || "Croshim Studio <onboarding@resend.dev>";

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const sendEmail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
};

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await sendEmail({
    to: toEmail,
    subject: "إعادة تعيين كلمة المرور — Croshim Studio",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px 24px; background: #faf9f7; border-radius: 16px; border: 1px solid #e8ddd5;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 2rem;">🧶</span>
          <h2 style="margin: 8px 0 4px; color: #0f172a; font-size: 1.4rem;">Croshim Studio</h2>
          <p style="color: #6b7280; margin: 0; font-size: 0.9rem;">إعادة تعيين كلمة المرور</p>
        </div>

        <p style="color: #374151; font-size: 1rem; line-height: 1.7; margin-bottom: 12px;">
          مرحباً،<br>
          تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لاختيار كلمة مرور جديدة.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9b3a5a, #e8a0b0); color: #fff; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 1rem; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            إعادة تعيين كلمة المرور
          </a>
        </div>

        <p style="color: #6b7280; font-size: 0.88rem; line-height: 1.6; margin-bottom: 0;">
          هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.<br>
          إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان.
        </p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e8ddd5;">
        <p style="color: #9ca3af; font-size: 0.8rem; text-align: center; margin: 0;">
          Croshim Studio — منصة الكروشيه
        </p>
      </div>
    `,
  });
}

async function sendWelcomeEmail({ toEmail, firstName, language = "ar" }) {
  const isEnglish = language === "en";
  const name = escapeHtml(firstName || (isEnglish ? "Crochet maker" : "صانعة الكروشيه"));

  if (isEnglish) {
    return sendEmail({
      to: toEmail,
      subject: "Welcome to Croshim Studio 🧶",
      html: `
        <div dir="ltr" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#faf9f7;border-radius:16px;border:1px solid #e8ddd5;">
          <div style="text-align:center;margin-bottom:28px;">
            <span style="font-size:2.5rem;">🧶</span>
            <h2 style="margin:8px 0 4px;color:#9b3a5a;">Welcome to Croshim Studio</h2>
            <p style="margin:0;color:#8b7280;font-size:.9rem;">A friendly place for crochet lovers</p>
          </div>
          <p style="color:#374151;line-height:1.9;font-size:1rem;">Hello ${name},<br><br>We're so happy to have you in the Croshim Studio community! ✨</p>
          <p style="color:#374151;line-height:1.8;">You can now create crochet patterns, save your ideas, share your products, and discover work from other makers.</p>
          <div style="margin:25px 0;padding:16px;background:#fff0f4;border-radius:12px;text-align:center;color:#8f3855;"><strong>Start your creative journey today 💗</strong></div>
          <p style="color:#6b7280;font-size:.88rem;line-height:1.7;">We hope your Croshim Studio experience is full of creativity and beautiful yarn.</p>
          <hr style="border:0;border-top:1px solid #e8ddd5;margin:24px 0;">
          <p style="margin:0;color:#9b7280;font-size:.78rem;text-align:center;">Croshim Studio — We write, make, and share with passion</p>
        </div>`,
    });
  }

  await sendEmail({
    to: toEmail,
    subject: "مرحباً بك في Croshim Studio 🧶",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#faf9f7;border-radius:16px;border:1px solid #e8ddd5;">

        <div style="text-align:center;margin-bottom:28px;">
          <span style="font-size:2.5rem;">🧶</span>
          <h2 style="margin:8px 0 4px;color:#9b3a5a;">
            أهلاً بك في Croshim Studio
          </h2>
          <p style="margin:0;color:#8b7280;font-size:.9rem;">
            مساحة جميلة لكل محبي الكروشيه
          </p>
        </div>

        <p style="color:#374151;line-height:1.9;font-size:1rem;">
          أهلاً ${name}،<br><br>
          سعداء جداً بانضمامك إلى مجتمع كروشيم ستوديو! ✨
        </p>

        <p style="color:#374151;line-height:1.8;">
          أصبح بإمكانك الآن إنشاء باترونات الكروشيه، حفظ أفكارك،
          مشاركة منتجاتك، واكتشاف أعمال مبدعين آخرين.
        </p>

        <div style="margin:25px 0;padding:16px;background:#fff0f4;border-radius:12px;text-align:center;color:#8f3855;">
          <strong>ابدئي رحلتك الإبداعية الآن 💗</strong>
        </div>

        <p style="color:#6b7280;font-size:.88rem;line-height:1.7;">
          نتمنى لك تجربة ممتعة ومليئة بالإبداع والخيوط الجميلة.
        </p>

        <hr style="border:0;border-top:1px solid #e8ddd5;margin:24px 0;">

        <p style="margin:0;color:#9b7280;font-size:.78rem;text-align:center;">
          Croshim Studio — نكتب، نصنع، ونشارك بشغف
        </p>
      </div>
    `,
  });
}

async function sendPatternReadyEmail({ toEmail, firstName, patternName, patternUrl }) {
  const name = escapeHtml(firstName || "صانعة الكروشيه");
  const title = escapeHtml(patternName || "باترن جديد");
  await sendEmail({
    to: toEmail,
    subject: `باترنك جاهز: ${patternName || "باترن جديد"} — Croshim Studio`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#faf9f7;border-radius:16px;border:1px solid #e8ddd5;">
        <div style="text-align:center;margin-bottom:28px;"><span style="font-size:2rem;">🧶</span><h2 style="margin:8px 0 4px;color:#0f172a;">Croshim Studio</h2></div>
        <p style="color:#374151;line-height:1.8;">أحسنتِ يا ${name}، تم حفظ باترنك <strong>${title}</strong> وهو جاهز للمراجعة والطباعة.</p>
        <div style="text-align:center;margin:28px 0;"><a href="${patternUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#9b3a5a,#e8a0b0);color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;">فتح الباترون</a></div>
      </div>`,
  });
}

async function sendPatternShareEmail({ toEmail, senderName, patternName, patternUrl, message }) {
  const sender = escapeHtml(senderName || "أحد أعضاء Croshim Studio");
  const title = escapeHtml(patternName || "باترن كروشيه");
  const note = message ? `<p style="background:#fdf0f3;border-radius:10px;padding:12px;color:#5a2a38;line-height:1.7;">${escapeHtml(message)}</p>` : "";
  await sendEmail({
    to: toEmail,
    subject: `${senderName || "Croshim Studio"} شارك معك باترن: ${patternName || "باترن كروشيه"}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#faf9f7;border-radius:16px;border:1px solid #e8ddd5;">
        <div style="text-align:center;margin-bottom:28px;"><span style="font-size:2rem;">🧶</span><h2 style="margin:8px 0 4px;color:#0f172a;">Croshim Studio</h2></div>
        <p style="color:#374151;line-height:1.8;">شارك معك ${sender} باترن <strong>${title}</strong>.</p>
        ${note}
        <div style="text-align:center;margin:28px 0;"><a href="${patternUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#9b3a5a,#e8a0b0);color:#fff;text-decoration:none;border-radius:14px;font-weight:bold;">فتح الباترون</a></div>
      </div>`,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPatternReadyEmail,
  sendPatternShareEmail,
};
