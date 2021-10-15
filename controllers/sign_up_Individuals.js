


const fs = require('fs');
const path = require('path');
const flash = require('connect-flash');
const Users = require('../models/Users');

var randomBytes = require('randombytes');

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


  
  const newUser=new Users({

    firstName_En:req.body.firstName_En,
    middleName_En:req.body.middleName_En,
    lastName_En:req.body.lastName_En,
    age:req.body.age,
    gender:req.body.gender,

    city:req.body.city,
    phone:req.body.phone,
    university:req.body.university,
    Specialty:req.body.Specialty,
    EducationLevel:req.body.EducationLevel,
    email:req.body.email,
    SCFHS:req.body.SCFHS,
    times:req.body.times,
    identity_id:req.body.identity_id,
    accept:"wait",
    url_video:req.body.url_video,






  })




      newUser.save(function(err){

        const email=req.body.email;

        Users.findOne({ email: email })
          .then(userDoc => {
            if (userDoc.email==req.body.email ) {
              req.flash('error', 'E-Mail exists already, please pick a different one.');

              res.redirect("/sign_up_Individuals")
          
            }
          }).catch(err=>{

  console.log(err);

          })



        if (!err) {

          req.flash('success', 'Success!!');
          res.redirect("/sign_up_Individuals")


          const email=req.body.email
          
          return transporter.sendMail({
            to:email,
            from:"Smav@dmet.edu.sa",
            subject:"succeed",
            html:`

            <p class="esd-block-image" align="center" style="font-size:0"><a href="https://www.smavacadmey.com" target="_blank"><img
            src="https://i.imgur.com/WuxuLUZ.png" alt style="display: block;" width="562"></a></p>





        
            <div style="text-align: center;">



            

<p style="color: #000000;">
    السلام عليكم ورحمة الله وبركاته

</p>




<p style="color: #000000;">


    عزيزي المتطوع

</p>

<p style="color: 000000;">

    تشكر لكم الأكاديمية السعودية للتطوع الصحي روح العطاء وحب الخير والمبادرة لخدمة المجتمع، كما يسعدنا إبلاغكم باستلام
    طلاب انضمامكم لبرنامج سماف مجتمعي ، وسنوافيكم بالرد خلال الأيام القادمة إن شاء الله
</p>


<p class="esd-block-banner" style="position: relative; color: black;" align="center" esdev-config="h2"><a target="_blank">
    <img class="adapt-img esdev-stretch-width esdev-banner-rendered" src="https://www.funimada.com/assets/images/cards/big/thank-you-9.gif" alt title width="70%">
</a>
</p>

</div>

        





    



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


  console.log(message);

  if (message.length > 0) {
    message = message[0];

    console.log(message);

  } 
  else {
    message = null;
   
    
  }

   if(message2.length > 0){

    message2 = message2[0];

    console.log(message2);

  } else{
    message2=null
  }

res.render('sign_up/sign_up_Individuals', {
  message: message,
  message2: message2,



});
}



//////




