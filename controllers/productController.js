const path = require("path");
const { v4: uuidv4 } = require("uuid");

const { Product, User } = require("../models");
const supabase = require("../util/supabase");

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

    
    console.log('products' , products);
    
    return res.render("displayInfo/dashboard", {
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
   GET /display_product
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
    console.log('products: ' , products);
    

    return res.render("displayInfo/all-products", {
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