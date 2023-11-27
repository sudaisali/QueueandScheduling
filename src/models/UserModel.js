const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')


//Fields
//username , email , password , confirmPassword 

const userSchema = new mongoose.Schema({
      name :{
        type : String,
         required : [true , "Please Enter your Name"],
      },
      email : {
        type:String,
        required : [true , 'Please Enter your Email'],
        // unique : true,
        // lowercase : true,
        // validate : [validator.isEmail , 'Please Enter a valid Email']
      },
      password:{
        type:String,
        required : [true,'Please Enter a Password'],
        minlength : 8,
        select:false
      },
      confirmPassword:{
        type:String,
        required:[true,'Please Confirm Your Password'],
        validate : {
          validator : function(val){ return val === this.password}, //Match pass and confirm pass
          message:"Password and Confirm Password must be same"
          },
     
    
      },
      role:{
       type:String,
       enum:['user','admin'],
       default : 'user'
      },
      isVerified:Boolean,
      passwordResetToken : String,
      passwordResetTokenExpiry:Date,
      verificationToken:String,
      verificationTokenExpiry:Date,
      passwordUpdatedAt:Date
})

//mongoose middle ware to encrypt pass
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password,12)
  this.confirmPassword = undefined;
  next()
})

//compare userpass and db password
userSchema.methods.comparePass = async function(userPass,dbPass){
  return await bcrypt.compare(userPass,dbPass)
}

// create and hash reset token 
userSchema.methods.createResetToken =  function(){
    const buffer =  crypto.randomBytes(32);  
    const resetToken = buffer.toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpiry = Date.now() + 10 *60*1000;
    return resetToken
}

//check password changed after jwt token send
userSchema.methods.isPasswordChanged = function(JwtTimeStamp){
  
  if(this.passwordUpdatedAt){
    const pswrdUpdateTimeStamp = Math.floor(this.passwordUpdatedAt.getTime() /1000)
    if(pswrdUpdateTimeStamp > JwtTimeStamp){
      return true
    }else{
      return false
    }
     
  }
  return false
}

//create   account verification token
userSchema.methods.createVerificationToken = function(){
  const buffer =  crypto.randomBytes(32);  
  const verificationToken = buffer.toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.verificationTokenExpiry = Date.now() + 24*60 *60*1000;
  this.isVerified = false
  return verificationToken
}


module.exports = mongoose.model('User',userSchema)