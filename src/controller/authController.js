require('dotenv').config()
const user = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const { sendEmail  } = require('../Utils/email')
const crypto = require('crypto')
const Job  = require('../Utils/schedulejobs')

function signToken(newUser) {
    return jwt.sign({
        id: newUser._id,
        email: newUser.email
    }, process.env.SECERET_STRING, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

module.exports = {
   
    signup: async (req, res,next) => {
        try {
            const role = req.body.role;
            if(role && role.toLowerCase() === 'admin'){
                return res.status(400).json({
                    message:"Sorry you are not able to register your self as a admin"
                })
            }
            const newUser = await user.create(req.body)
            const verificationToken = newUser.createVerificationToken()
            newUser.save({ validateBeforeSave: false })
            const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyuser/${verificationToken}`;
            const message = `Verify Your account  by using below link\n\n${resetUrl}\n\n`
            try {
                const jobData = {
                    email: newUser.email,
                    subject: 'Account Verification Email',
                    message: message,
                  };

                  for(i=0 ; i<20 ; i++){

                      await Job.emailJob.add(jobData);
                  }
                  
                // await sendEmail({
                //     email: newUser.email,
                //     subject: "Account Verification Email",
                //     message: message
                // })
                res.status(200).json({
                    status: "success",
                    message: "Account Verification email link send to your email"
                })
            } catch (error) {
                newUser.verificationToken = undefined;
                newUser.verificationTokenExpiry = undefined;
                newUser.save({ validateBeforeSave: false })
                const err = res.json({
                    message:error.message
                }) 
                next(err); 
            }

        } catch (error) {

            const err = res.json({
                message:error.message
            }) 
            next(err); 
        }


    },
    verifyUser: async (req, res, next) => {
        const accountVerificationToken = req.params.token;
        const encryptToken = crypto.createHash('sha256').update(accountVerificationToken).digest('hex');

        try {
            const verifyUser = await user.findOne({ verificationToken: encryptToken, verificationTokenExpiry: { $gt: Date.now() } });

            if (!verifyUser) {
                const error = new Error("Verification Token is expired");
                error.status = 400;
                throw error;
            }

            verifyUser.isVerified = true;
            verifyUser.verificationToken = undefined;
            verifyUser.verificationTokenExpiry = undefined;
            await verifyUser.save({ validateBeforeSave: false });

            res.status(200).json({
                status: "success",
                message: "You are Verified Successfully"
            });
        } catch (error) {

            const err = res.json({
                message:error.message
            }) 
            next(err); 
        }
    },
    loginUser: async (req, res, next) => {
        try{

        
        const { email, password } = req.body
        //check user enter email and password
        if (!email || !password) {
            const error = res.json({
                "message": "Please Enter Email and Password"
            })
            return next(error)
        }
        //check password and email both are match 
        const loginUser = await user.findOne({ email }).select('+password')
        
        if (!loginUser || !(await loginUser.comparePass(password, loginUser.password))) {
            const error = res.json({
                "message": "Please Enter Correct Email & Password"
            })
            return next(error)
        }
        if (loginUser.isVerified == false) {
            const error = res.json({
                message: "Sorry Your account is not verified"
            })
             next(error)
        }
        //If above condition pass then generate token
        const token = signToken(loginUser)
        res.status(200).json({
            status: "success",
            token,
            message: "You are Login Successfully"
        })
    }catch (error) {

        const err = res.json({
            message:error.message
        }) 
        next(err); 
    }


    },
    forgetPassword: async (req, res, next) => {
        try {
            // 1- get user based on email
            const User = await user.findOne({ email: req.body.email });
    
            if (!User) {
                return res.status(404).json({
                    message: "User with this email does not exist"
                });
            }
    
            // 2- generate random reset token
            const resetToken = User.createResetToken();
    
            // save password verification token and expiry in db
            await User.save({ validateBeforeSave: false });
    
            // 3- send back token to the user email
            const resetUrl = `${req.protocol}://${req.get('host')}/user/resetpassword/${resetToken}`;
            const message = `Reset your password by using the link:\n\n${resetUrl}\n\n`;
    
            try {


                // await sendEmail({
                //     email: user.email,
                //     subject: "Password change message",
                //     message: message
                // });
                const jobData = {
                    email: User.email,
                    subject: 'Forget Password verification',
                    message: message,
                  };
                  for(i=0 ; i<20 ; i++){
                    
                      await Job.forgetPasswordJob.add(jobData);
                  }
                  
                return res.status(200).json({
                    status: "success",
                    message: "Password reset link sent to your email"
                });
            } catch (error) {
                User.passwordResetToken = undefined;
                User.passwordResetTokenExpiry = undefined;
                await user.save({ validateBeforeSave: false });
    
                return next(error);
            }
        } catch (error) {
            // Handle errors thrown in the outer try-catch block
            return next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        try{
        //get ResetToken from url params
        const passwordResetToken = req.params.token
        const encryptToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
        const resetUser = await user.findOne({ passwordResetToken: encryptToken, passwordResetTokenExpiry: { $gt: Date.now() } })
        if (!resetUser) {
            const error = res.json({
                status: "Failed",
                message: "Password Token is expired"
            })
            next(error)
        }
        resetUser.password = req.body.password;
        resetUser.confirmPassword = req.body.confirmPassword;
        resetUser.passwordResetToken = undefined;
        resetUser.passwordResetTokenExpiry = undefined;
        resetUser.passwordUpdatedAt = Date.now();
        //find user with the help of token
        //check Token expiry from current data
        //update new password

        resetUser.save()
        res.status(200).json({
            status: "success",
            message: "Password Changed SuccessFully"
        })
    }catch (error) {

        const err = res.json({
            message:error.message
        }) 
        return next(err); 
    }


    }
}