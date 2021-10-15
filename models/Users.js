
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



var smav2Schema =new Schema({


  firstName_En:String,
  middleName_En:String,
  lastName_En:String,
  email:{ type: String, required: true, unique: true },
  phone:Number,
  gender:String,
  age:Number,
  city:Array,
  university:String,
  EducationLevel:Array,
  Specialty:Array,
  SCFHS:String,
  times:String,
  accept:String,
  url_video:String,
  identity_id:{ type: Number, required: true, unique: true },

 
  

});





module.exports = mongoose.model('Users', smav2Schema);