const User = require("../models/user");
const Feedback = require("../models/feedback");

const TYPES = ["suggestion", "complaint"];
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 5000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const pickType = (value) => (TYPES.includes(value) ? value : "suggestion");

/* =========================================================
  Feedback Page 
   GET /feedback
   Open to everyone — visitors and members. Logged-in users
   get their name and email filled in for them.
   ========================================================= */
exports.getFeedbackPage = async (req, res, next) => {
  try {
    const prefill = { name: "", email: "", message: "" };

    if (req.session.userId) {
      const user = await User.findByPk(req.session.userId);
      if (user) {
        prefill.name = [user.firstName, user.lastName].filter(Boolean).join(" ");
        prefill.email = user.email || "";
      }
    }

    res.render("pages/feedback", {
      pageTitle: `Croshim Studio | ${res.locals.t.fb_title}`,
      selectedType: pickType(req.query.type),
      prefill,
      formError: null,
    });
  } catch (err) {
    console.error("getFeedbackPage error:", err);
    next(err);
  }
};

/* =========================================================
   POST /feedback
   ========================================================= */
exports.postFeedback = async (req, res) => {
  const t = res.locals.t;
  const type = pickType(req.body.type);
  const name = (req.body.name || "").trim().slice(0, 120);
  const email = (req.body.email || "").trim().slice(0, 160);
  const message = (req.body.message || "").trim();

  // Re-render on error so a long message is never lost
  const renderWithError = (formError) =>
    res.render("pages/feedback", {
      pageTitle: `Croshim Studio | ${t.fb_title}`,
      selectedType: type,
      prefill: { name, email, message: message.slice(0, MAX_MESSAGE) },
      formError,
    });

  // Honeypot — hidden from humans, filled in by naive bots
  if ((req.body.website || "").trim()) {
    req.flash("success", t.fb_success);
    return res.redirect("/feedback");
  }

  if (message.length < MIN_MESSAGE) return renderWithError(t.fb_err_short);
  if (message.length > MAX_MESSAGE) return renderWithError(t.fb_err_long);
  if (email && !EMAIL_RE.test(email)) return renderWithError(t.fb_err_email);

  try {
    await Feedback.create({
      type,
      name: name || null,
      email: email || null,
      message,
      user_id: req.session.userId || null,
    });

    req.flash("success", t.fb_success);
    res.redirect("/feedback");
  } catch (err) {
    console.error("postFeedback error:", err);
    renderWithError(t.fb_err_server);
  }
};
