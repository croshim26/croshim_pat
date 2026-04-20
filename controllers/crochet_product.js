const fs = require('fs');
const path = require('path');




const { v4: uuidv4 } = require("uuid");
const supabase = require("../util/supabase");
const product = require("../models/product");
const user = require("../models/user");
const supabaseAdmin = require("../util/supabase");



// associations
user.hasMany(product, { foreignKey: "user_id" });
product.belongsTo(user, { foreignKey: "user_id" });



exports.getproduct = async (req, res, next) => {
  // console.log(supabaseAdmin.storage.getBucket);
  
   try {
     const userId = req.session.userId;
 
     if (!userId) {
       req.flash("error", "Please login first.");
       return res.redirect("/");
     }
 
     // Optional: verify user exists
     const currentUser = await user.findByPk(userId, { attributes: ["id",'firstName','lastName'] });
     if (!currentUser) {
       req.flash("error", "Session expired or user not found.");
       return res.redirect("/");
     }
 
     // IMPORTANT: use the correct FK column name:
     // If your Product column is userId:
     const products = await product.findAll({
      attributes: ["user_id",'product_name','product_description','pdf_path' ,'id'], // keep it lean
      where: { user_id: userId }
    })

    console.log(userId);
    
 
     // If your Product column is user_id instead, use:
     // const products = await product.findAll({ where: { user_id: userId }, order: [["createdAt","DESC"]] });
//  console.log(products);

    res.render("displayInfo/home", {
       products:products
     });
   } catch (err) {

        // console.log(products);
     next(err);
     res.redirect("/");
   }
 };

exports.getAddProduct=(req,res,next)=>{   
   // console.log("csrf:", req.csrfToken());
   res.render("includes/includes_nav/add_product")

   }


  exports.postAddProduct = async (req, res, next) => {
  try {
    // 1) Ensure user exists
    const user_table = await user.findByPk(req.session.userId, {
      attributes: ["id"],
    });

    if (!user_table) {
      req.flash("error", "Session expired or user not found.");
      return res.redirect("/home");
    }

    // 2) Read form data
    const { product_name, product_description } = req.body;
    const user_idd = req.session.userId;

    if (!product_name || !product_description) {
      req.flash("error", "Please fill in all fields.");
      return res.redirect("/home");
    }

    // 3) Default PDF path is null
    let pdfPathh = null;

    // 4) If a file exists, validate and upload it to Supabase
    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        req.flash("error", "Only PDF files are allowed.");
        return res.redirect("/home");
      }

      const ext = path.extname(req.file.originalname) || ".pdf";
      const fileName = `${user_idd}/${uuidv4()}${ext}`;

      // console.log(supabaseAdmin.storage.from(process.env.SUPABASE_BUCKET));
      console.log("Using bucket:", process.env.SUPABASE_BUCKET);
      

      const { error: uploadError } = await supabaseAdmin.storage.from(process.env.SUPABASE_BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        req.flash("error", "Failed to upload PDF.");
        return res.redirect("/home");
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(fileName);

      pdfPathh = publicUrlData.publicUrl;
    }

    // 5) Create product
    await product.create({
      product_name,
      product_description,
      user_id: user_idd,
      pdf_path: pdfPathh,
    });

    req.flash("success", "Course added successfully.");
    return res.redirect("/home");
  } catch (err) {
    console.error("postAddProduct error:", err);

    if (err?.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "This course already exists.");
      return res.redirect("/home");
    }

    req.flash("error", "Failed to add course. Please try again.");
    return res.redirect("/home");
  }
};


  exports.getdisplay_product = async (req, res, next) => {
    try {
      const products = await product.findAll({
        attributes: ["user_id", "product_name", "product_description", "pdf_path"],
        include: [
          {
            model: user,
            attributes: ["firstName", "lastName"]
          }
        ]
      });
  
      res.render("displayInfo/display_product", {
        products: products,
      });
  
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  };


exports.deleteProduct = async (req, res, next) => {
    console.log('productId');
    
    try {
      const productId = req.params.productId;
      const userId = req.session.userId;

      
      
  
      // 1) تأكد أن المنتج موجود ويخص نفس المستخدم
      const productItem = await product.findOne({
        where: {
          id: productId,
          user_id: userId
        }
      });
  
      if (!productItem) {
        
        
        req.flash("error", "Product not found or not authorized.");
        return res.redirect("/home");
      }
  
      // 2) حذف المنتج
      await productItem.destroy();
  
      req.flash("success", "Product deleted successfully.");
      return res.redirect("/home");
  
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to delete product.");
      return res.redirect("/home");
    }
  };

