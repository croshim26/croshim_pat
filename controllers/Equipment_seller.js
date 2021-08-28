const fs = require('fs');
const path = require('path');
// var crypto = require("crypto-js");
// const crypto = require('crypto');
const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport")

const adminDb = require('../models/adminDb');

const bcrypt = require('bcryptjs');

const tables = require('../models/tables');
const saltRounds = 10;

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
  api_key:"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"
  
  
  }
  
  }))


exports.postRegister=(req,res,next)=>{


  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    const newUser=new tables({
      firstNameA:req.body.firstNameA,
      password:hash,
    email:req.body.email,

    lastNameA:req.body.lastNameA,
    phone:req.body.phone,
    dest:{"non":"non"},
    tools:{"non":"non"},
    courses:{"non":"non"},

  
    })



    console.log("jj");
    


        newUser.save(function(err){

          const email=req.body.email
            const password = req.body.password;



            tables.findOne({ email: email }).then(userDoc => {
              if (userDoc) {
                req.flash('error', 'E-Mail exists already, please pick a different one.');
                res.redirect("/Equipment_sellerRegister")
              
              }
            }).catch(err=>{

    console.log(err);

            })



          if (!err) {

            req.flash('success', 'تم ارسال طلبكم ');
            res.redirect("/Equipment_sellerRegister")
          
            

          }else{
            console.log(err);
          }
        })

  });





  }

exports.getRegister=(req,res,next)=>{

  let message2 = req.flash('success');
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
      

      
    } else {
      message = null;
      
    }

    if (message2.length > 0) {
      message2 = message2[0];
    } else {
      message2 = null;
    }
  



    res.render('Equipment_seller/Equipment_sellerRegister', {
      
      message: message,
      message2:message2
    });



}

exports.postLogin=(req,res,next)=>{


  

  
  const email=req.body.email
  const password=req.body.password

  
  

  
  tables.findOne({email:email}).then(tables =>{
  
  

  
      if(tables){
  
        bcrypt.compare(password, tables.password, function(err, result) {
  
          if (result===true) {

  
            console.log(req.session);
            req.session.loggedIn=true;
            req.session.tables=tables
  
            req.session.save(err => {
            console.log(err);
                  res.redirect("/Equipment_seller")
            });
  
          }
          
          else{

        
            
  
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/');
  
          }
  });  
  }
  else{

    adminDb.findOne({email:email}).then(admin =>{

      if(admin){
  
        bcrypt.compare(password, admin.password, function(err, result) {
  
          if (result===true) {

  
            console.log(req.session);
            req.session.loggedIn=true;
            req.session.admin=admin
  
            req.session.save(err => {
            console.log(err);
                  res.redirect("/display_Course")
            });
  
          }
          
          else{

        
            
  
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/');
  
          }
  });  
  }



    })

  }
    })

  }

exports.getLogin=(req,res,next)=>{



  
  res.render('Equipment_seller/Equipment_sellerLogin')
    
}



exports.getReset = (req, res, next) => {

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }



  let message2 = req.flash('success');
  if (message2.length > 0) {
    message2 = message2[0];
  } else {
    message2 = null;
  }



  res.render('Equipment_seller/Equipment_sellerReset',{
    message:message,
    message2:message2


  })
};

exports.postReset=(req,res,next)=>{
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/Equipment_sellerReset');
    }
    const token = buffer.toString('hex');
    tables.findOne({ email: req.body.email })
      .then(smav => {
        if (!smav) {
          
          
          req.flash('error', 'No account with that email found.');
          return res.redirect('/Equipment_sellerReset');
        }
      
        
        smav.resetToken = token;
        
        return smav.save();
      })
      .then(result => {
        req.flash('success', 'it success ! conguraltion!!');
        res.redirect("/Equipment_sellerReset")
       


        transporter.sendMail({

          to: req.body.email,
          from: 'autofocuswebsite@gmail.com',
          subject: 'اعادة كلمة المرور',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://${process.env.PORT ||"localhost:3000"}/Equipment_seller_new_password/${token}">link</a> to set a new password.</p>
          `
        });

      })
      .catch(err => {
        console.log(err);
      });

  });









}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  tables.findOne({ resetToken: token })
    .then(smav => {
  

      
      
      res.render('Equipment_seller/eq_new_password', {
      
    
        smavId: smav._id.toString(),
        passwordToken: token,
      
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const smavId = req.body.smavId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  tables.findOne({
    resetToken: passwordToken,
    _id: smavId
  })
    .then(smav => {
      resetUser = smav;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {

   
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
};
