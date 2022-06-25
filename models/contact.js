const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
const contactSchema = new mongoose.Schema({
    role:{
        type: Number,
        trim:true,
        required:true,
    },
    name:{
        type: String,
        trim:true,
        required:true,
        maxlength:32
    },
    email:{
        type: String,
        trim:true,
        required:true,
        maxlength:32
    },
    query:{
        type: String,
        trim:true,
        required:true,
    },
},{timestamps:true});

module.exports = mongoose.model("Contact",contactSchema);