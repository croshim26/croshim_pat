const express = require("express");

const router = express.Router();

router.get("/policy", (req, res) => {
  const isEnglish = res.locals.lang === "en";

  res.render("pages/policy", {
    pageTitle: isEnglish
      ? "Order Policy & Intellectual Property Rights | Croshim Studio"
      : "سياسة الطلب وحقوق الملكية الفكرية | كروشيم ستوديو",
    seo: {
      title: isEnglish
        ? "Order Policy & Intellectual Property Rights | Croshim Studio"
        : "سياسة الطلب وحقوق الملكية الفكرية | كروشيم ستوديو",
      description: isEnglish
        ? "Croshim Studio's order policy and intellectual property rights policy."
        : "سياسة الطلب وحقوق الملكية الفكرية لمنصة كروشيم ستوديو.",
    },
  });
});

module.exports = router;
