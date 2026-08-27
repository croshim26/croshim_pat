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
   GET /all-products
   Show all products with owner names and linked patterns.
   ========================================================= */
const ALL_PRODUCTS_PAGE_SIZE = 12;

exports.getAllProducts = async (req, res) => {
  try {
    /* cover_image can hold a multi-MB base64 data URL, so the listing is
       paginated rather than loading every published product at once. */
    const requestedPage = Number.parseInt(req.query.page, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = ALL_PRODUCTS_PAGE_SIZE;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      attributes: [
        "id", "user_id", "product_name",
        "product_description", "pdf_path", "createdAt","is_pattern_published"
      ],
      include: [
        // phone deliberately not selected: /all_products is public, no PII on it
        { model: User, attributes: ["firstName", "lastName"] },
        {
          model: SavedPattern,
          as: "pattern",
          attributes: ["id", "name", "emoji", "cover_image", "createdAt"],
          required: false,
        },
      ],
      where: { is_published: true ,},
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    // A page number past the end should not be a dead end
    if (page > totalPages) {
      return res.redirect(`/all_products?page=${totalPages}`);
    }

    return res.render("pages/all_products", {
      products,
      pagination: { page, totalPages, totalProducts: count, pageSize: limit },
      success_message: req.flash("success")[0] || null,
      error_message: req.flash("error")[0] || null,
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    // Public page: never bounce visitors into the login-only dashboard
    return res.status(500).render("500", { pageTitle: "Server Error" });
  }
};

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
        'is_published',
        'is_pattern_published'
      ],
        include: [
        {
          model: SavedPattern,
          as: "pattern",
          attributes: ["id", "name", "emoji", "cover_image", "createdAt"],
          required: false,
        },
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
   POST /ProductPublished
   Show The product.
   ========================================================= */
exports.toggleProductPublished = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, user_id: req.session.userId },
    });
    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/dashboard');
    }

    product.is_published = !product.is_published;
    await product.save();

    req.flash('success', product.is_published ? 'تم نشر المنتج' : 'تم إخفاء المنتج');
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('toggleProductPublished error:', error);
    req.flash('error', 'Failed to update.');
    return res.redirect('/dashboard');
  }
};

/* =========================================================
   POST /PatternPublished
   Show The Pattern.
   ========================================================= */
exports.togglePatternPublished = async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, user_id: req.session.userId },
    });
    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/dashboard');
    }

    product.is_pattern_published = !product.is_pattern_published;
    await product.save();

    req.flash('success', product.is_pattern_published ? 'تم نشر الباترون' : 'تم إخفاء الباترون');
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('togglePatternPublished error:', error);
    req.flash('error', 'Failed to update.');
    return res.redirect('/dashboard');
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
  const user = await User.findByPk(req.session.userId);
  const savedPatterns = await SavedPattern.findAll({
    where: { created_by: req.session.userId },
    attributes: ["id", "name", "emoji", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  const effectiveLimit = user.is_admin ? 0 : (user.pattern_limit !== null && user.pattern_limit !== undefined ? user.pattern_limit : 5);
  res.render("pages/pattern_builder", {
    pageTitle: "Pattern Builder",
    savedPatterns,
    patternLimit: effectiveLimit,
    ...locals(req),
  });
};

exports.savePattern = async (req, res) => {
  try {
    const { id, name, subtitle, emoji, cover_image, tools, abbrs, parts, color_theme } = req.body;
    let pattern;
    if (id) {
      pattern = await SavedPattern.findOne({ where: { id, created_by: req.session.userId } });
      if (pattern) await pattern.update({ name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts, color_theme: color_theme || 'rose' });
    }
    if (!pattern) {
      const user = await User.findByPk(req.session.userId);
      const effectiveLimit = user.is_admin ? 0 : (user.pattern_limit !== null && user.pattern_limit !== undefined ? user.pattern_limit : 5);
      if (effectiveLimit > 0) {
        const count = await SavedPattern.count({ where: { created_by: req.session.userId } });
        if (count >= effectiveLimit) {
          return res.status(403).json({ success: false, error: 'limit' });
        }
      }
      pattern = await SavedPattern.create({
        name: name || "باترن جديد", subtitle, emoji, cover_image, tools, abbrs, parts,
        color_theme: color_theme || 'rose',
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

exports.uploadCoverImage = async (req, res) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }
    const userId = req.session.userId;
    const ext = path.extname(req.file.originalname) || '.jpg';
    const storageKey = `${userId}/covers/${uuidv4()}${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(storageKey, Buffer.from(req.file.buffer), {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadError) {
      console.error('uploadCoverImage storage error:', {
        bucket: process.env.SUPABASE_BUCKET,
        storageKey,
        message: uploadError.message,
      });
      return res.status(502).json({ success: false, error: uploadError.message });
    }
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(storageKey);
    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err) {
    // "fetch failed" here means Node could not reach SUPABASE_URL at all
    // (bad project ref / DNS / offline) — not a problem with the image.
    const unreachable = err.message === 'fetch failed';
    console.error('uploadCoverImage error:', err);
    if (unreachable) {
      console.error(
        `  ↳ could not reach Supabase at ${process.env.SUPABASE_URL} — check SUPABASE_URL and network`
      );
    }
    res.status(unreachable ? 502 : 500).json({
      success: false,
      error: unreachable ? 'Image storage is unreachable' : err.message,
    });
  }
};

exports.savePatternPdf = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, patternId, pdf_data } = req.body;

    if (!pdf_data) return res.status(400).json({ success: false, error: 'No PDF data' });

    const pdfBuffer  = Buffer.from(pdf_data, 'base64');
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
    console.error('savePatternPdf error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.savePatternAsProduct = async (req, res) => {
  console.log('test test');
  
  try {
    const userId    = req.session.userId;
    const { name, description, patternId } = req.body;
    const pdfPath   = patternId ? `/pattern/${patternId}` : null;
    const saved_pattern_id=patternId

    // Dedup: if this pattern already has a product entry, update it instead of creating a duplicate
    const existing = await Product.findOne({ where: { user_id: userId, pdf_path: pdfPath } });
    if (existing) {
      await existing.update({ product_name: name || 'باترن كروشيه', product_description: description || '' });
      return res.json({ success: true, productId: existing.id });
    }

    const product = await Product.create({
      product_name:        name || 'باترن كروشيه',
      product_description: description || '',
      user_id:             userId,
      pdf_path:            pdfPath,
      saved_pattern_id: saved_pattern_id || null,
    });

    res.json({ success: true, productId: product.id });
  } catch (err) {
    console.error('savePatternAsProduct error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};