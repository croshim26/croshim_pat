require("dotenv").config();

const path = require("path");
const express = require("express");
const flash = require("connect-flash");
const session = require("express-session");
const connectSessionSequelize = require("connect-session-sequelize");
const csrf = require("csurf");
const multer = require("multer");

const crochetRegisterRoutes = require("./routes/authRoutes");
const crochetProductRoutes = require("./routes/productRoutes");
const crochetChatRoutes = require("./routes/chatRoutes");

const sequelize = require("./util/database");

const app = express();

/* =========================================================
   View Engine Setup
   ========================================================= */
app.set("view engine", "ejs");
app.set("views", "views");

/* =========================================================
   Body Parser
   Parses normal form submissions.
   Note: multipart/form-data is handled by Multer below.
   ========================================================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =========================================================
   Static Files
   Public assets such as CSS, JS, images.
   ========================================================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   Session Store
   Stores sessions inside PostgreSQL using Sequelize.
   ========================================================= */
const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
});

/* =========================================================
   Session Middleware
   Must come before flash and csrf.
   ========================================================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* =========================================================
   Flash Messages
   Requires session middleware before it.
   ========================================================= */
app.use(flash());

/* =========================================================
   Multer Upload Middleware
   Must run before csurf when using multipart/form-data,
   because csurf needs access to req.body._csrf.
   
   Better long-term:
   Move this into the product route only instead of global app.use.
   ========================================================= */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }

    return cb(null, false);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

app.use(upload.single("product_pdf"));

/* =========================================================
   CSRF Protection
   Comes after session and after Multer.
   ========================================================= */
app.use(csrf());

/* =========================================================
   Global View Variables
   Available in all EJS files.
   ========================================================= */
app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.loggedIn);
  res.locals.csrfToken = req.csrfToken();

  res.locals.errorMessage = req.flash("error")[0] || null;
  res.locals.successMessage = req.flash("success")[0] || null;

  next();
});

/* =========================================================
   Routes
   ========================================================= */
app.get("/", (req, res) => {
res.render("pages/landing", {
  error_message: req.flash("error")[0] || null,
  success_message: req.flash("success")[0] || null,
});
});

app.use(crochetRegisterRoutes);
app.use(crochetProductRoutes);
app.use(crochetChatRoutes);

/* =========================================================
   404 Handler
   ========================================================= */
// app.use((req, res) => {
//   res.status(404).render("404", {
//     pageTitle: "Page Not Found",
//   });
// });

/* =========================================================
   Error Handler
   Handles CSRF errors and general app errors.
   ========================================================= */
app.use((err, req, res, next) => {
  console.error("App error:", err);

  if (err.code === "EBADCSRFTOKEN") {
    req.flash("error", "Invalid or expired form submission. Please try again.");
    return res.redirect("/");
  }

  res.status(500).render("500", {
    pageTitle: "Server Error",
  });
});

/* =========================================================
   Start Server
   Authenticate DB, sync tables, sync session table, then listen.
   ========================================================= */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync();
    console.log("Database models synced.");

    await sessionStore.sync();
    console.log("Session store synced.");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();