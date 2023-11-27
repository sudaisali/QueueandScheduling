const express = require('express')
const router = express.Router()
const user = require('../controller/userController')
const authorizeUser = require('../middleware/authorize')




router.route("/createuser")
.post(authorizeUser.authorizeUser,authorizeUser.checkrole('admin'),user.createUser)

router.route("/getusers")
.get(authorizeUser.authorizeUser,authorizeUser.checkrole('admin'),user.getAllUser)


module.exports = router