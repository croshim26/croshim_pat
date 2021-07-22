const fs = require('fs');
const path = require('path');
// var crypto = require("crypto-js");
// const crypto = require('crypto');
const nodemailer=require("nodemailer")
const sendgridTransport=require("nodemailer-sendgrid-transport")


const bcrypt = require('bcryptjs');

const tables = require('../models/tables');
const saltRounds = 10;

const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
  api_key:"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"
  
  
  }
  
  }))


//   "abomshari_2015@hotmail.com",
//   "sanadebal-10@hotmail.com",
//   "auood688@gmail.com",
//   "han9n99@gmail.com",
//   "ahmadbinturki0@gmail.com",
//   "wd_502@hotmail.com",
//   "hamoalotaibi@moh.gov.sa",
//   "zoz.fh7@gmail.com",
//   "sohen1421@gmail.com",
//   "ohoud-1405@hotmail.com,"
//   "kamlh-ali@hotmail.com",
//   "amrshams70@hotmail.com",
//   "roba-2002@hotmail.com",
//   "hum_333@hotmail.com",
//   "h.h1419@hotmail.com",
//   "talb.igi@gmail.com",
//   "youssef-1416@hotmail.com",
//   "bntalganoob@hotmail.com",
//   "bnt_sab@hotmail.com",
//   "ayman.ae90@gmail.com",
//  " kat6943@gmail.com",
//   "gfdd7781@icloud.com",
//  "ysaerboali@gmail.com",
//   "suralharthi@moh.gov.sa",
//   "khalidhalal.1418@gmail.com",
//   "aboodie4000@hotmail.com",
//   "sun.top2009@hotmail.com",
//   "dho99ome@hotmail.com",
//   "a.z.r.oo.v@gmail.com",
//  "abooody.1409@hotmail.com",
//   "iradiz.m@gmail.com",
//   "soud009@hotmail.com,"
//   "fallata319@gmail.com",
//   "ala2alattas@gmail.com",
//   "algufeeri925@gmail.com",
//   "azoozy1888@gmail.com",
//   "soosooooo998@gmail.com",
//   "mramalnaeli@gmail.com",
//   "thekrasuliman@gmail.com",
//   "m.alshareef888@gmail.com",
//   "paramedic251@hotmail.com",
//   "sarah10oct10@gmail.com",
//   "alasiry700@hotmail.com",
//   "naa542@gmail.com",
//   "vip6085@hotmail.com",
//   "mawadda8@hotmail.com",
//   "rgd.kh.1998@gmail.com",
//   "dr.bzamzami@gmail.com",
//   "almon4er-141@hotmail.com",
//   "142haif@gmail.com",
//   "hazematea1976@gmail.com",
//   "abdulaziz.altoub@gmail.com",
//   "vipfa1@hotmail.com",
//   "rawaaror222@gmail.com",
//   "ssalzaidi@moh.gov.sa",
//   "zm-ceo@dmet.edu.sa",
//   "dkzn4bj8tn@privaterelay.appleid.com",
//   "xxaromaxx1@gmail.com",
//   "sale7halwani@gmail.com",
//   "bdr_7750@hotmail.com",
//   "motairi-1992@hotmail.com",
//   "hwsawysfyt8@gmail.com",
//   "aljohania49@gmail.com",
//   "nedaa.sami8@gmail.com",
//   "zm.office2017@gmail.com",
//   "sadeemalrhaily@gmail.com",
//   "maysoun-3-990@hotmail.com",
//   "hano-n2011@hotmail.com",
//  " osha.1985@icloud.com",
//   "ab_almalki@hotmail.com",
//   "sakurandu3@hotmail.com",
//   "rer-1122@hotmail.com",
//   "abojylan32@gmail.com",
//   "safiahawsawi@hotmail.com",
//   "khaled.m11@hotmail.com",
//   "moaalgahmdic8788@gmail.com",
//   "noufnouf523@gmail.com",
//   "jmana-1420@hotmail.com",
//   "hajar1401@hotmail.com",
//   "hot130sa@gmail.com",
//   "dob9637@gmail.com",
//   "maramsultan20@gmail.com",
//   "queensara2001@gmail.com",
//   "fawaz.alqurashi11@gmail.com",
//   "feysal859@gmail.com",
//   "mmbb095@gmail.com",
//   "f15@gmx.com",
//   "sahar.com@gmail.com",
//   "abo-da5l@hotmail.com",
//   "raghad.fh4@gmail.com",
//   "majedaldhrah@gmail.com",
//   "hanashpt@gmail.com",
//   "dodialmarjan@gmail.com",
//   "dmet@dmet.edu.sa",
//   "smralharbi44@gmail.com",
//   "captmalak1@gmail.com",
//   "najuti2@gmail.com",
//   "faifi11320@gmail.com",
//   "yarabb33@gmail.com",
//   "d7oom0554@hotmail.com",
//   "bdreaha@moh.gov.sa",
//   "khalid.m.alattas@gmail.com",
//   "v.i.p5111@hotmail.com",
//   'nouuraa465@gmail.com"

exports.postRegister=(req,res,next)=>{


  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    const newUser=new tables({
      firstNameA:req.body.firstNameA,
      password:hash,
    email:req.body.email,

    lastNameA:req.body.lastNameA,
    phone:req.body.phone
  
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
