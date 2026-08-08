const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/user");
const { sendPasswordResetEmail } = require("../util/mailer");

const SALT_ROUNDS = 10;

/* =========================================================
   GET Register Page
   ========================================================= */
exports.getRegister = (req, res) => {
  res.render("pages/register", {
    success_message: req.flash("success")[0] || null,
    error_message: req.flash("error")[0] || null,
  });
};

/* =========================================================
   POST Register
   Creates a new user after validating email and hashing password.
   ========================================================= */
exports.postRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, country, gender, crochet_experience, age } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/register");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      req.flash("error", "Email already exists.");
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      country:            country            || null,
      gender:             gender             || null,
      crochet_experience: crochet_experience || null,
      age:                age ? parseInt(age) : null,
    });

    req.flash("success", "Registration completed successfully.");
    return res.redirect("/");
  } catch (error) {
    console.error("postRegister error:", error);

    if (error?.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "Email already exists.");
      return res.redirect("/register");
    }

    req.flash("error", "Registration failed. Please try again.");
    return res.redirect("/register");
  }
};

/* =========================================================
   GET Login Page
   ========================================================= */
exports.getLogin = (req, res) => {
  if (req.session.loggedIn) return res.redirect("/dashboard");
  res.redirect("/");
};

/* =========================================================
   POST Login
   Validates user credentials and creates a secure session.
   ========================================================= */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Please enter email and password.");
      return res.redirect("/");
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (!existingUser) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/");
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordIsValid) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/");
    }

    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        console.error("Session regenerate error:", regenerateError);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/");
      }

      req.session.loggedIn = true;
      req.session.userId = existingUser.id;
      req.session.userName = existingUser.firstName || "";
      req.session.isAdmin = existingUser.is_admin === true;

      existingUser.last_login = new Date();
      existingUser.save().catch((e) => console.error("last_login save error:", e));

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);
          req.flash("error", "Login failed. Please try again.");
          return res.redirect("/");
        }

        return res.redirect("/dashboard");
      });
    });
  } catch (error) {
    console.error("postLogin error:", error);
    req.flash("error", "Login failed. Please try again.");
    return res.redirect("/");
  }
};

/* =========================================================
   GET /reset
   Show the "enter your email" form.
   ========================================================= */
exports.getResetRequest = (req, res) => {
  res.render("pages/reset_request", {
    error_message: req.flash("error")[0] || null,
    success_message: req.flash("success")[0] || null,
  });
};

/* =========================================================
   POST /reset
   Generate token, save to user, send reset email.
   ========================================================= */
exports.postResetRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      req.flash("error", "يرجى إدخال البريد الإلكتروني.");
      return res.redirect("/reset");
    }

    const user = await User.findOne({ where: { email } });

    // Always show success to prevent email enumeration
    if (!user) {
      req.flash("success", "إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة قريباً.");
      return res.redirect("/reset");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ reset_token: token, reset_token_expiry: expiry });

    const resetUrl = `${process.env.APP_URL}/reset/${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    req.flash("success", "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.");
    return res.redirect("/reset");
  } catch (err) {
    console.error("postResetRequest error:", err);
    req.flash("error", "حدث خطأ. يرجى المحاولة مجدداً.");
    return res.redirect("/reset");
  }
};

/* =========================================================
   GET /reset/:token
   Show the "enter new password" form if token is valid.
   ========================================================= */
exports.getResetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      req.flash("error", "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.");
      return res.redirect("/reset");
    }

    res.render("pages/reset_password", {
      token,
      error_message: req.flash("error")[0] || null,
    });
  } catch (err) {
    console.error("getResetPassword error:", err);
    req.flash("error", "حدث خطأ. يرجى المحاولة مجدداً.");
    return res.redirect("/reset");
  }
};

/* =========================================================
   POST /reset/:token
   Validate token, update password, clear token.
   ========================================================= */
exports.postResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (!password || password.length < 8) {
      req.flash("error", "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
      return res.redirect(`/reset/${token}`);
    }

    if (password !== confirm_password) {
      req.flash("error", "كلمتا المرور غير متطابقتين.");
      return res.redirect(`/reset/${token}`);
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      req.flash("error", "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.");
      return res.redirect("/reset");
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({ password: hashed, reset_token: null, reset_token_expiry: null });

    req.flash("success", "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
    return res.redirect("/");
  } catch (err) {
    console.error("postResetPassword error:", err);
    req.flash("error", "حدث خطأ. يرجى المحاولة مجدداً.");
    return res.redirect(`/reset/${req.params.token}`);
  }
};

/* =========================================================
   GET /profile
   ========================================================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect("/");
    res.render("pages/profile", {
      user,
      success_message: req.flash("success")[0] || null,
      error_message:   req.flash("error")[0]   || null,
    });
  } catch (e) {
    console.error("getProfile error:", e);
    res.redirect("/dashboard");
  }
};

/* =========================================================
   POST /profile  — update personal info
   ========================================================= */
exports.postProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect("/");

    const { firstName, lastName, phone, country, gender, crochet_experience, age } = req.body;

    user.firstName          = firstName          || user.firstName;
    user.lastName           = lastName           || user.lastName;
    user.phone              = phone              || user.phone;
    user.country            = country            || null;
    user.gender             = gender             || null;
    user.crochet_experience = crochet_experience || null;
    user.age                = age ? parseInt(age) : null;

    await user.save();
    req.session.userName = user.firstName;

    req.flash("success", "تم تحديث الملف الشخصي بنجاح.");
    res.redirect("/profile");
  } catch (e) {
    console.error("postProfile error:", e);
    req.flash("error", "حدث خطأ. يرجى المحاولة مجدداً.");
    res.redirect("/profile");
  }
};

/* =========================================================
   POST /profile/password  — change password
   ========================================================= */
exports.postProfilePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.redirect("/");

    const { current_password, new_password, confirm_password } = req.body;

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid) {
      req.flash("error", "كلمة المرور الحالية غير صحيحة.");
      return res.redirect("/profile");
    }

    if (new_password !== confirm_password) {
      req.flash("error", "كلمتا المرور الجديدتان غير متطابقتين.");
      return res.redirect("/profile");
    }

    if (new_password.length < 8) {
      req.flash("error", "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return res.redirect("/profile");
    }

    user.password = await bcrypt.hash(new_password, SALT_ROUNDS);
    await user.save();

    req.flash("success", "تم تغيير كلمة المرور بنجاح.");
    res.redirect("/profile");
  } catch (e) {
    console.error("postProfilePassword error:", e);
    req.flash("error", "حدث خطأ. يرجى المحاولة مجدداً.");
    res.redirect("/profile");
  }
};

/* =========================================================
   POST Logout
   Destroys the user session and redirects to login page.
   ========================================================= */
exports.postLogout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
      return res.redirect("/dashboard");
    }

    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
};