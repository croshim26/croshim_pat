const bcrypt = require("bcrypt");
const User = require("../models/user");

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
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      req.flash("error", "Please fill in all required fields.");
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
  res.render("pages/dashboard", {
    error_message: req.flash("error")[0] || null,
    success_message: req.flash("success")[0] || null,
  });
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