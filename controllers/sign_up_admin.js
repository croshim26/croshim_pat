

const fs = require('fs');
const path = require('path');

const adminDb = require('../models/adminDb');

const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport")


const bcrypt = require('bcryptjs');
const saltRounds = 10;

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:"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"
  
  
  }
  
  }))


exports.postRegister=(req,res,next)=>{


  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  const newUser=new adminDb({
    name:req.body.name,
    email:req.body.email,
    password:hash,


  
  })


      newUser.save(function(err){

        const email=req.body.email

        adminDb.findOne({ email: email })
        .then(userDoc => {
          if (email==req.body.email ) {
            req.flash('error', 'E-Mail exists already, please pick a different one.');

            res.redirect("/sign_up_admin")
        
          }else if(userDoc.identity_id==req.body.identity_id){
            req.flash('error', 'E-Mail exists already, please pick a different one.');
          }
        }).catch(err=>{

console.log(err);

        })



        if (!err) {


          req.flash('success', 'Success!!');
          res.redirect("/sign_up_admin")

        }else{
          console.log(err);
        }
      })





    })





}

exports.getRegister=(req,res,next)=>{

  let message = req.flash('error');

  let message2 = req.flash('success');
  if (message.length > 0) {
    message = message[0];

  } else {
    message = null;
    
  }

  if (message2.length > 0) {
    message2 = message2[0];

  }
  else {
    message2 = null;
  }
res.render('sign_up/sign_up_admin', {
  message: message,
  message2:message2

});
}


exports.postLogin=(req,res,next)=>{


  

  
  const email=req.body.email
  const password=req.body.password

 
  adminDb.findOne({email:email}).then(admin =>{


 if(admin){

bcrypt.compare(password, admin.password, function(err, result) {
  console.log("error_users");
  if (result===true) {
   

    console.log(req.session);
    req.session.loggedIn=true;
    req.session.admin=admin

    req.session.save(err => {
    console.log(err);
          res.redirect("/display_group")

          
    });

  }
  
  else{


    console.log("error_users");

    req.flash('error', 'Invalid email or password.');
    return res.redirect('/');

   

  }
}); 

 

  
}

    })

  }









exports.getLogin=(req,res,next)=>{
  let message = req.flash('error');

  let message2 = req.flash('success');
  if (message.length > 0) {
    message = message[0];

  } else {
    message = null;
    
  }

  if (message2.length > 0) {
    message2 = message2[0];

  }
  else {
    message2 = null;
  }


  
  res.render('admin/login_admin',{
    message: message,
    message2: message2,

  })
    
}





///////////
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};




