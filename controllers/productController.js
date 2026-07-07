const path = require("path");
const { v4: uuidv4 } = require("uuid");
const SavedPattern = require("../models/saved_pattern");

const { Product, User } = require("../models");
const supabase = require("../util/supabase");
const { log } = require("console");


const locals = (req, extra = {}) => ({
  successMessage: req.flash("success")[0] || null,
  errorMessage: req.flash("error")[0] || null,
  ...extra,
});


/* =========================================================
   GET /dashboard
   Show products that belong to the logged-in user.
   ========================================================= */
exports.getProducts = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      req.flash("error", "Please login first.");
      return res.redirect("/");
    }

    const currentUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName"],
    });

    if (!currentUser) {
      req.flash("error", "Session expired or user not found.");
      return res.redirect("/");
    }

    const products = await Product.findAll({
      attributes: [
        "id",
        "user_id",
        "product_name",
        "product_description",
        "pdf_path",
        "createdAt",
      ],
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    
    
    return res.render("pages/dashboard", {
      products,
      currentUser,
      success_message: req.flash("success")[0] || null,
      error_message: req.flash("error")[0] || null,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    return next(error);
  }
};

/* =========================================================
   GET /add_product
   Show add product form.
   ========================================================= */
exports.getAddProduct = (req, res) => {
  return res.render("includes/includes_nav/add_product", {
    success_message: req.flash("success")[0] || null,
    error_message: req.flash("error")[0] || null,
  });
};

/* =========================================================
   POST /add_product
   Create product and upload optional PDF to Supabase.
   ========================================================= */
exports.createProduct = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      req.flash("error", "Please login first.");
      return res.redirect("/");
    }

    const currentUser = await User.findByPk(userId, {
      attributes: ["id"],
    });

    if (!currentUser) {
      req.flash("error", "Session expired or user not found.");
      return res.redirect("/");
    }

    const {
      product_name: productName,
      product_description: productDescription,
    } = req.body;

    if (!productName || !productDescription) {
      req.flash("error", "Please fill in all fields.");
      return res.redirect("/add_product");
    }

    let pdfUrl = null;
    let pdfStorageKey = null;

    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        req.flash("error", "Only PDF files are allowed.");
        return res.redirect("/add_product");
      }

      const fileExtension = path.extname(req.file.originalname) || ".pdf";
      pdfStorageKey = `${userId}/${uuidv4()}${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(pdfStorageKey, Buffer.from(req.file.buffer), {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        req.flash("error", "Failed to upload PDF.");
        return res.redirect("/add_product");
      }

      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(pdfStorageKey);

      pdfUrl = publicUrlData.publicUrl;
    }

    await Product.create({
      product_name: productName.trim(),
      product_description: productDescription.trim(),
      user_id: userId,
      pdf_path: pdfUrl,
    });

    req.flash("success", "Course added successfully.");
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("createProduct error:", error);

    if (error?.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "This course already exists.");
      return res.redirect("/add_product");
    }

    req.flash("error", "Failed to add course. Please try again.");
    return res.redirect("/add_product");
  }
};

/* =========================================================
   GET /all-products
   Show all products with owner names.
   ========================================================= */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "user_id",
        "product_name",
        "product_description",
        "pdf_path",
        "createdAt",
      ],
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.render("pages/all_products", {
      products,
      success_message: req.flash("success")[0] || null,
      error_message: req.flash("error")[0] || null,
    });
  } catch (error) {

    console.error("getAllProducts error:", error);
    req.flash("error", "Failed to load products.");
    return res.redirect("/dashboard");
  }
};

/* =========================================================
   POST /delete_product/:productId
   Delete product owned by logged-in user.
   ========================================================= */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      req.flash("error", "Please login first.");
      return res.redirect("/");
    }

    const productItem = await Product.findOne({
      where: {
        id: productId,
        user_id: userId,
      },
    });

    if (!productItem) {
      req.flash("error", "Product not found or not authorized.");
      return res.redirect("/dashboard");
    }

    await productItem.destroy();

    req.flash("success", "Product deleted successfully.");
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("deleteProduct error:", error);
    req.flash("error", "Failed to delete product.");
    return res.redirect("/dashboard");
  }
};




/* ── Pattern Builder ───────────────────────────────────── */
exports.getPatternBuilder = async (req, res) => {
  const savedPatterns = await SavedPattern.findAll({
    where: { created_by: req.session.userId },
    attributes: ["id", "name", "emoji", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  res.render("pages/pattern_builder", {
    pageTitle: "Pattern Builder",
    savedPatterns,
    ...locals(req),
  });
};

exports.savePattern = async (req, res) => {
  try {
    const { id, name, subtitle, emoji, cover_image, tools, abbrs, parts } = req.body;
    let pattern;
    if (id) {
      pattern = await SavedPattern.findOne({ where: { id, created_by: req.session.userId } });
      if (pattern) await pattern.update({ name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts });
    }
    if (!pattern) {
      pattern = await SavedPattern.create({
        name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts,
        created_by: req.session.userId,
      });
    }
    res.json({ success: true, pattern });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.loadPattern = async (req, res) => {
  const pattern = await SavedPattern.findOne({ where: { id: req.params.id, created_by: req.session.userId } });
  if (!pattern) return res.status(404).json({ error: "not found" });
  res.json(pattern);
};

exports.deletePattern = async (req, res) => {
  try {
    const pattern = await SavedPattern.findOne({ where: { id: req.params.id, created_by: req.session.userId } });
    if (pattern) await pattern.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.savePatternAsProduct = async (req, res) => {
  
  try {
    const userId = req.session.userId;
    const { name, description, pdf_data } = req.body;

    if (!pdf_data) return res.status(400).json({ success: false, error: 'No PDF data provided' });

    const pdfBuffer = Buffer.from(pdf_data, 'base64');
    const storageKey = `${userId}/patterns/${uuidv4()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(storageKey, pdfBuffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) return res.status(500).json({ success: false, error: uploadError.message });

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(storageKey);

    const product = await Product.create({
      product_name:        name || 'باترن كروشيه',
      product_description: description || '',
      user_id:             userId,
      pdf_path:            publicUrlData.publicUrl,
    });

    res.json({ success: true, productId: product.id });
  } catch (err) {
    console.error('savePatternAsProduct error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};