require("dotenv").config();

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const connectSessionSequelize = require("connect-session-sequelize");
const { doubleCsrf } = require("csrf-csrf");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const crochetRegisterRoutes = require("./routes/authRoutes");
const crochetProductRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const patternRoutes = require("./routes/patternRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const i18n = require("./middleware/i18n");

const sequelize = require("./util/database");

const app = express();

/* =========================================================
   Trust Proxy
   Required on Heroku so Express sees HTTPS from the load balancer.
   ========================================================= */
app.set("trust proxy", 1);

/* =========================================================
   Security Headers (Helmet)
   ========================================================= */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://code.jquery.com",
          "https://cdn.jsdelivr.net",
          "https://stackpath.bootstrapcdn.com",
          "https://unpkg.com",
          "https://developers.facebook.com",
          "https://www.googletagmanager.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://stackpath.bootstrapcdn.com",
          "https://use.fontawesome.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://use.fontawesome.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/* =========================================================
   Compression
   Gzip all responses — 60-80% bandwidth saving.
   ========================================================= */
app.use(compression());

/* =========================================================
   HTTP Logging (Morgan)
   ========================================================= */
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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

/* Pattern-builder saves carry base64 reference photos inside the parts JSON,
   so those endpoints need a much larger body limit than the rest of the app.
   Note: this parser runs first, so a route-level express.json() would be a
   no-op — the limit has to be decided here. */
const jsonSmall = express.json({ limit: "1mb" });
const jsonLarge = express.json({ limit: "60mb" });
const LARGE_JSON_PATHS = new Set([
  "/pattern-builder/save",
  "/pattern-builder/save-pdf",
]);

app.use((req, res, next) =>
  LARGE_JSON_PATHS.has(req.path)
    ? jsonLarge(req, res, next)
    : jsonSmall(req, res, next)
);

/* =========================================================
   Static Files
   Public assets such as CSS, JS, images.
   ========================================================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   Cookie Parser
   Required by csrf-csrf to read the CSRF cookie.
   ========================================================= */
app.use(cookieParser());

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
      secure: process.env.NODE_ENV === "production",
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
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      return cb(null, true);
    }
    return cb(null, false);
  },
  limits: {
    fileSize: 40 * 1024 * 1024, // 40MB — modern phone photos exceed 10MB
  },
});

app.use((req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) req.file = req.files[0];
    next();
  });
});

/* =========================================================
   CSRF Protection (csrf-csrf — double-submit cookie pattern)
   Replaces archived csurf. Comes after session and Multer.
   ========================================================= */
const { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  getSessionIdentifier: (req) => req.session.id,
  cookieName: process.env.NODE_ENV === "production" ? "__Host-csrf" : "csrf",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  /* Header first (fetch/JSON and multipart uploads), then the hidden
     _csrf field used by classic EJS form posts. */
  getCsrfTokenFromRequest: (req) =>
    req.headers["x-csrf-token"] || req.body?._csrf,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

app.use(doubleCsrfProtection);

/* =========================================================
   Global View Variables
   Available in all EJS files.
   ========================================================= */
app.use(i18n);

app.post('/set-lang', (req, res) => {
  req.session.lang = req.body.lang === 'en' ? 'en' : 'ar';
  const back = req.get('Referer') || '/';
  res.redirect(back);
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.loggedIn);
  res.locals.csrfToken = generateCsrfToken(req, res);

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

/* Public routes must be mounted before adminRoutes: that router applies
   isAdmin to every request reaching it, which would redirect visitors away. */
app.use(feedbackRoutes);

app.use(adminRoutes);
app.use(patternRoutes);

/* =========================================================
   404 Handler
   ========================================================= */
app.use((req, res) => {
  res.status(404).render("404");
});

/* =========================================================
   Error Handler
   Handles CSRF errors and general app errors.
   ========================================================= */
app.use((err, req, res, next) => {
  console.error("App error:", err);

  // fetch() callers expect JSON, not a redirect or an HTML error page
  const wantsJson =
    req.xhr ||
    (req.headers.accept || "").includes("application/json") ||
    (req.headers["content-type"] || "").includes("application/json") ||
    req.path.startsWith("/pattern-builder/");

  if (err === invalidCsrfTokenError) {
    if (wantsJson) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired session. Please refresh the page.",
      });
    }
    req.flash("error", "Invalid or expired form submission. Please try again.");
    return res.redirect("/");
  }

  if (err.type === "entity.too.large" || err.code === "LIMIT_FILE_SIZE") {
    const msg = "File is too large. Please use a smaller image.";
    if (wantsJson) return res.status(413).json({ success: false, error: msg });
    req.flash("error", msg);
    return res.redirect(req.get("Referer") || "/");
  }

  if (wantsJson) {
    return res.status(500).json({ success: false, error: "Server error" });
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

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("Database models synced.");
    }

    await sessionStore.sync();
    console.log("Session store synced.");

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
      server.close(() => {
        sequelize.close().finally(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT",  shutdown);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();