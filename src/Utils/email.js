require("dotenv").config()
const nodemailer = require('nodemailer')

const sendEmail = async (options) =>{
    //create Transpoter service to send email
    
    const transporter = nodemailer.createTransport({
        // host: process.env.EMAIL_HOST,
        // port:process.env.EMAIL_PORT,
        service : 'gmail',
        auth:{
            user : "sudaisali420@gmail.com",
            pass : "xnodudrjmwqhuuzd"
            // user : process.env.EMAIL_USER,
            // pass : process.env.EMAIL_PASSWORD
        }
    })

    //Define email options
    const emailOptions = {
        from : 'Auth&Auth <sudaisbinsohail@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message

    }

    await transporter.sendMail(emailOptions)
}

module.exports = {sendEmail}