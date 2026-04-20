const fs = require('fs');
const path = require('path');

const user = require('../models/user');
// const saltRounds = 10;
// const bcrypt = require('bcryptjs');

const bcrypt = require("bcrypt");
const { log } = require('console');
const saltRounds = 10;

exports.postRegister = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // 1) Check if email already exists
    const existing = await user.findOne({ where: { email } });
    if (existing) {
      req.flash("error", "Email already exists");
      return res.redirect("/crochet_Register");
    }

    // 2) Hash password
    const hash = await bcrypt.hash(password, saltRounds);

    // 3) Create user (Sequelize create already saves)
    await user.create({
      firstName,
      lastName,
      email,
      phone,
      password: hash,
    });

    req.flash("success", "Registration completed successfully");
    return res.redirect("/crochet_Register");
  } catch (err) {
    console.error(err);

    // 4) Handle duplicate email if UNIQUE constraint exists (race condition)
    if (err?.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "Email already exists");
      return res.redirect("/crochet_Register");
    }

    req.flash("error", "Registration failed. Please try again.");
    return res.redirect("/crochet_Register");
  }
};





exports.getRegister = (req, res) => {
  let error = req.flash("error");
  let success = req.flash("success");
  
  // console.log(error);
  // console.log(success);
  


  res.render("crochet_user/crochet_Register", {
    success_message: success.length ? success[0] : null,
    error_message: error.length ? error[0] : null,
  });
};





exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Find user
    const existingUser = await user.findOne({ where: { email } });
    if (!existingUser) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/");
    }

    // 2) Compare password (existingUser.password should be the HASH)
    const ok = await bcrypt.compare(password, existingUser.password);
    if (!ok) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/");
    }

    // 3) Regenerate session (prevents session fixation)
    return req.session.regenerate((err) => {
      if (err) {
        console.error("Session regenerate error:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/");
      }

      // 4) Store minimal info in session
      req.session.loggedIn = true;
      req.session.userId = existingUser.id;

      // optional: safe display info (not sensitive)
      req.session.userName = existingUser.firstNameA || existingUser.firstName || "";

      // 5) Save session then redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          req.flash("error", "Login failed. Please try again.");
          return res.redirect("/");
        }
        return res.redirect("/home");
      });
    });
  } catch (err) {
    console.error("postLogin error:", err);
    req.flash("error", "Login failed. Please try again.");
    return res.redirect("/");
  }
};

exports.getLogin=(req,res,next)=>{



  
  res.render('displayInfo/home')
    
}


exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};