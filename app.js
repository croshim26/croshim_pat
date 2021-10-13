
const path = require('path');
const fs = require('fs');


const https = require('https');
const mongoose = require("mongoose");







const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const mongodbStore=require("connect-mongodb-session")(session)
const csrf=require("csurf")

// const helmet = require('helmet')
var compression = require('compression')
var morgan = require('morgan')









const sign_up_Individuals  = require('./routes/sign_up_Individuals');

const sign_up_group=require("./routes/sign_up_group");

const sign_up_admin=require("./routes/sign_up_admin");

const whoSMAV=require("./routes/whoSMAV");

const WhatWeDo=require("./routes/WhatWeDo");



 
const admin=require("./routes/admin");
















const Users = require('./models/Users');



const samvHajjGroup = require('./models/samvHajjGroup');



const AdminDb = require('./models/adminDb');





const mongodbURI=`mongodb://dmet:0505564500@cluster0-shard-00-00.24wbx.mongodb.net:27017,cluster0-shard-00-01.24wbx.mongodb.net:27017,cluster0-shard-00-02.24wbx.mongodb.net:27017/samvHajj?ssl=true&replicaSet=atlas-e0tytm-shard-0&authSource=admin&retryWrites=true&w=majority`;



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



app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({
  extended: true}));

  app.use(
    multer({ storage: fileStorage}).single('excel'))

  app.use(express.static(path.join(__dirname, 'public')));

  app.use("/images",express.static(path.join(__dirname, 'images')));

  
  app.use(session({
    secret: 'our little secret.',
    resave: false,
    saveUninitialized: false,
    store:store
  
  }));


  app.use(flash());

  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
  );


  app.use(compression());
  app.use(morgan('combined', { stream: accessLogStream }));

  app.use(csrfProtection);






  app.use((req,res,next)=>{

    res.locals.isAuthenticated =req.session.loggedIn
  res.locals.csrfToken=req.csrfToken();
  next();
  })
  


  app.use(sign_up_Individuals);
  app.use(whoSMAV);
  app.use(WhatWeDo);
  app.use(sign_up_group);

  app.use(admin);
  app.use(sign_up_admin);




  app.use((req, res, next) => {
    if (!req.session.l) {
      return next();
    }
    samvHajjUsers.findById(req.session.l._id)
      .then(place => {
        console.log(req.session.l._id);
        req.place = place;
        next();
      })
      .catch(err => console.log(err));
  });
  app.get("/",function(req,res){

    var groups=false;
    var users=false;

    if(req.session.samvHajjUsers){
       users=true;
      
    }

   else if(req.session.samvHajjGroup){
       groups=true;
      
    }
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
    res.render('home', {
      message: message,
        message2: message2,
        groups:groups,
        users:users
    });
})




mongoose.connect(mongodbURI,{
  useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true 
})
.then(result => {


  app.listen(process.env.PORT ||3000);
    })
    .catch(err => {
    });



  