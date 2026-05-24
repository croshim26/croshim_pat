const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await resend.emails.send({
    from: "Crochet Hub <onboarding@resend.dev>",
    to: toEmail,
    subject: "إعادة تعيين كلمة المرور — Crochet Hub",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px 24px; background: #faf9f7; border-radius: 16px; border: 1px solid #e8ddd5;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 2rem;">🧶</span>
          <h2 style="margin: 8px 0 4px; color: #0f172a; font-size: 1.4rem;">Crochet Hub</h2>
          <p style="color: #6b7280; margin: 0; font-size: 0.9rem;">إعادة تعيين كلمة المرور</p>
        </div>

        <p style="color: #374151; font-size: 1rem; line-height: 1.7; margin-bottom: 12px;">
          مرحباً،<br>
          تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. انقر على الزر أدناه لاختيار كلمة مرور جديدة.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6b65ad, #e08aa0); color: #fff; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 1rem; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            إعادة تعيين كلمة المرور
          </a>
        </div>

        <p style="color: #6b7280; font-size: 0.88rem; line-height: 1.6; margin-bottom: 0;">
          هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.<br>
          إذا لم تطلب إعادة التعيين، يمكنك تجاهل هذه الرسالة بأمان.
        </p>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e8ddd5;">
        <p style="color: #9ca3af; font-size: 0.8rem; text-align: center; margin: 0;">
          Crochet Hub — منصة الكروشيه
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
