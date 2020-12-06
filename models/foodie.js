const mongoose = require('mongoose');
const crypto = require('crypto');
// const uuidv1 = require('uuid');
const { v1: uuidv1 } = require('uuid');



const foodieSchema = new mongoose.Schema({
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
        unique:32
    },
    hashed_password:{
        type: String,
        trim:true,
        required:true,
        maxlength:64
    },
    about:{
        type: String,
        trim:true,
    },
    salt: String,
    role:{
        type:Number,
        // 0 means foodie
        // 1 means foodlancer
        // 2 means admin
        default:0
    },
    history:{
        type:Array,
        default:[]
    }
},{timestamps:true});


// virtual fields

foodieSchema.virtual('password')
.set(function(password){
    this._password = password
    this.salt = uuidv1()
    this.hashed_password = this.encryptPassword(password)
})
.get(function(){
    return this._password
})


foodieSchema.methods = {

    authenticate:function(plainText){
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword: function(password){
        if(!password) return '';
        try{
            return crypto.createHmac('sha1',this.salt)
                         .update(password)
                         .digest('hex');
        }catch(err){
            return "";
        }
    }
}


module.exports = mongoose.model("Foodie",foodieSchema);