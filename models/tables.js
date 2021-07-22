
const mongoose = require('mongoose');

const Schema = mongoose.Schema;



var smav2Schema =new Schema({

    firstNameA:String,
    lastNameA:String,
    email:{ type: String, required: true, unique: true },
    password:String,
  phone:Number,
  roomImage:String,
  resetToken:String,
    dest:[],
    tools:[],
    courses:[],
    city:String,
    inst:String,
    education:String,
    roomImage:String,
    date:String,
    photoshop:String,
    montage:String,
    programming:String,
    communication:String,
    teamWork:String,
    bio:String,
 
});






module.exports = mongoose.model('tables', smav2Schema);