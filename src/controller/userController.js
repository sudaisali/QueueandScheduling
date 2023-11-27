const user = require('../models/UserModel')
const { sendEmail } = require('../Utils/email')


const createUser = async(req,res,next)=>{
    try {
        const role = req.body.role;
        if(role && role.toLowerCase() === 'user'){
            return res.status(400).json({
                message:"Sorry you are not able to create account as a user"
            })
        }
        if(!role){
            return res.status(403).json({
                message:"Please Enter role"
            })
        }
        const newUser = await user.create(req.body)
        const verificationToken = newUser.createVerificationToken()
        newUser.save({ validateBeforeSave: false })
        const resetUrl = `${req.protocol}://${req.get('host')}/user/verifyuser/${verificationToken}`;
        const message = `Verify Your account  by using below link\n\n${resetUrl}\n\n`
        try {
            await sendEmail({
                email: newUser.email,
                subject: "Account Verification Email",
                message: message
            })
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


}



const getAllUser= async (req,res)=>{
    try{
        const Users = await user.find()
        res.status(200).json({
            status:"Success",
            Users
        })

    }catch(error){
        res.status(400).json({
            status:"Failed"
        })

    }
    
}


module.exports = {getAllUser , createUser}