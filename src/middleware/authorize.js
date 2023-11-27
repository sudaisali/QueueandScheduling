require('dotenv').config()
const user = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const util = require('util')



const authorizeUser = async (req, res, next) => {
    try {
        //1 - Read The Token If it Exist

        const token = req.headers.authorization
        let tokenValue
        if (token && token.startsWith('Bearer')) {
            tokenValue = token.split(' ')[1]
        }
        if (!token) {
            const error = res.json({
                message: "Sorry You are Not Logged in"
            })
            return next(error)
        }


        //2-Validate Token
        const decodeToken = await util.promisify(jwt.verify)(tokenValue, process.env.SECERET_STRING)

        //3-Check User Exist
        const loginUser = await user.findById(decodeToken.id)
        if (!loginUser) {
            const error = res.json({
                message: "User with given Token Does Not Exist"
            })
            return next(error)
        }

        //4-Check if user changed password after token is issued

        if (loginUser.isPasswordChanged(decodeToken.iat)) {
            const error = {
                message: "Password has been changed."
            };
            return res.status(400).json(error);
        }
        
        //save login user to request 
        req.user = loginUser
        

    } catch (error) {
        res.status(401).json({
            message: error.message
        })
    }
    
    next()
}

const checkrole = (role) =>{

    return (req , res , next)=>{
        if(req.user.role !== role){
            return res.status(400).json({
                message:"Sorry you are not authorize"
            })
        }
        next()
    }
   
}



module.exports = {authorizeUser , checkrole}