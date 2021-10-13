
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



var smav2Schema =new Schema({

  fullName:String,


  identity_id:{ type: Number, required: true, unique: true },

  email:String,
  phone:Number,

  company:String ,
  jopTitle:String,
  TeamSize:String,
  groupNumber:String,
  password:String,

  excel:String,
  reason:String,
  resetToken:String




});






module.exports = mongoose.model('samvHajjGroup', smav2Schema);