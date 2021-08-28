
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



var adminSchema =new Schema({
  name:String,
  email:String,
  password:String,
 



});






module.exports = mongoose.model('adminDb', adminSchema);