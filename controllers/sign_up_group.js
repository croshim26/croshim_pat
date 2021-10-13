

const fs = require('fs');
const path = require('path');

const samvHajjGroup = require('../models/samvHajjGroup');

var randomBytes = require('randombytes');
const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport")


const bcrypt = require('bcryptjs');
const adminDb = require('../models/adminDb');


const saltRounds = 10;


const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key:"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"
    
  }
  
  }))

exports.postRegister=(req,res,next)=>{
  const excel =req.file;
  console.log(req.file);
  console.log(req.body)
  // console.log(image);

  const newUser=new samvHajjGroup({
    fullName:req.body.fullName,

    identity_id:req.body.identity_id,

    email:req.body.email,
    phone:req.body.phone,
    company:req.body.company,
    jopTitle:req.body.jopTitle,
    TeamSize:req.body.TeamSize,
    groupNumber:req.body.groupNumber,
    accept:"wait",
    excel:excel.path,
    reason:"none"
    

  
  })


      newUser.save(function(err){

        const email=req.body.email

        samvHajjGroup.findOne({ email: email })
        .then(userDoc => {
          if (userDoc.email==req.body.email ) {
            req.flash('error', 'E-Mail exists already, please pick a different one.');

            res.redirect("/sign_up_group")
        
          }
          else if(userDoc.identity_id==req.body.identity_id){
            req.flash('error', 'E-Mail exists already, please pick a different one.');
          }
        }).catch(err=>{


          console.log(err);

        })

        if (!err) {


          req.flash('success', 'Success!!');
          res.redirect("/sign_up_group")

          const email=req.body.email
          return transporter.sendMail({
            to:email,
            from:"smav@dmet.edu.sa",
            subject:"succeed",
            html:`
            
            <h1> الرجاء ارسال ملف يتضمن فيه الاسم الاول واسم اب والاسم الاخير والايميل </h1>"

            
            `
            
            
            
            
          })

        }else{
          console.log(err);
        }
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
res.render('sign_up/sign_up_group', {
  message: message,
  message2:message2

});
}


