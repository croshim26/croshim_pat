const path = require('path');
const fs = require('fs');

const mongoose = require("mongoose");

const https = require('https');


const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const mongodbStore=require("connect-mongodb-session")(session)
const csrf=require("csurf")






const PutInfo = require('./routes/PutInfo');

const Equipment_seller  = require('./routes/Equipment_seller');

const putInfo_placeLessore=require("./routes/putInfo_placeLessore");


const admin = require('./routes/admin');

const sign_up_admin = require('./routes/sign_up_admin');









const displayInfo=require("./routes/displayInfo");
const tables = require('./models/tables');

const mongodbURI="mongodb://place:0505564500@cluster0-shard-00-00.doria.mongodb.net:27017,cluster0-shard-00-01.doria.mongodb.net:27017,cluster0-shard-00-02.doria.mongodb.net:27017/auto_Focus?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority"


const app = express();

const store =new mongodbStore({
  uri:mongodbURI,
  collection:"session"



})

const csrfProtection=csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
})


const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg'||
       file.mimetype === 'image/jpeg'||
       file.mimetype === 'image/png'
  )


   {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({
  extended: true}));

  app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('roomImage'))

  app.use(express.static(path.join(__dirname, 'public')));

  app.use("/images",express.static(path.join(__dirname, 'images')));
  app.use(session({
    secret: 'our little secret.',
    resave: false,
    saveUninitialized: false,
    store:store
  
  }));

  app.use(csrfProtection);
  app.use(flash());


  app.use((req,res,next)=>{

    res.locals.isAuthenticated =req.session.loggedIn
  res.locals.csrfToken=req.csrfToken();
  next();
  })
  
  app.use(PutInfo);


  app.use(Equipment_seller);
  app.use(displayInfo);

  app.use(putInfo_placeLessore);

  app.use(admin);

  app.use(sign_up_admin);


  


  
  
  
 


  app.use((req, res, next) => {
    if (!req.session.l) {
      return next();
    }
    tables.findById(req.session.l._id)
      .then(place => {
        console.log(req.session.l._id);
        req.place = place;
        next();
      })
      .catch(err => console.log(err));
  });
  app.get("/",function(req,res){

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
    res.render('main', {
      message: message,
        message2: message2
    });
})



mongoose.connect(mongodbURI)
.then(result => {

      app.listen(process.env.PORT||3000);
    })
    .catch(err => {
    });
