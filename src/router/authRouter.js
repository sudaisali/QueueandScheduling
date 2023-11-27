const express = require('express')
const router = express.Router()
const authUser = require('../controller/authController')
const user = require('../controller/userController')
const authorizeUser = require('../middleware/authorize')


router.route('/signup')
      .post(authUser.signup)   

router.route('/login')
      .post(authUser.loginUser) 

router.route('/forgetpassword')
      .post(authUser.forgetPassword)

router.route('/resetpassword/:token')
      .patch(authUser.resetPassword)

router.route('/verifyuser/:token')
      .get(authUser.verifyUser)




module.exports = router