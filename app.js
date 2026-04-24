require('dotenv').config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const connectSessionSequelize = require("connect-session-sequelize");
const csrf = require("csurf");
const multer = require("multer");

const crochet_Register = require("./routes/crochet_Register");
const crochet_product = require("./routes/crochet_product");

const sequelize = require("./util/database");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// ✅ Parse normal forms (NOT multipart)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "folders")));
app.use("/folders", express.static(path.join(__dirname, "folders")));

// ====== Session Store ======
const SequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
});

// ====== Sessions Middleware (must be before flash + csrf) ======
app.use(
  session({
    secret: "CHANGE_THIS_SECRET_NOW",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true
    },
  })
);

app.use(flash());


// Multer BEFORE csurf
const fileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({
    storage: fileStorage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  }).single("product_pdf")
);

// ✅ Now csurf can read _csrf (from req.body)
app.use(csrf());

// ✅ Provide csrfToken to all EJS views
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.loggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// ✅ Routes
app.use(crochet_Register);
app.use(crochet_product);

// ✅ Home route bug fix (you used message2 which doesn’t exist)
app.get("/", (req, res) => {
  let error_message = req.flash("error");
  let success_message = req.flash("success");

  error_message = error_message.length ? error_message[0] : null;
  success_message = success_message.length ? success_message[0] : null;

  res.render("main", {
    message: error_message,
    message2: success_message,
  });
});
// test
// ✅ Sync once, then listen
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await sessionStore.sync();
    console.log("DB + session store ready");
    app.listen(process.env.PORT || 3000);
  } catch (e) {
    console.error(e);
  }
})();

// postgres://u9d60sj6c4jkh4:pc5cbadd1e89d1f8f0c0940d78e98490a469aa577584335c55d26e51ee0e7d6e2@cev42lb8cu49j6.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d565aq8u7a7tev
