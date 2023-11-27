const express = require('express')
const router = express.Router()
const task = require('../controller/taskController')
const authorizeUser = require('../middleware/authorize')




router.route("/createtask")
.post(authorizeUser.authorizeUser,authorizeUser.checkrole('admin'),task.createTask)

router.route("/deletetask/:id")
.get(authorizeUser.authorizeUser,authorizeUser.checkrole('admin'),task.softDeleteTask)

router.route("/tasks")
.get(authorizeUser.authorizeUser,authorizeUser.checkrole('admin'),task.getAllTasks)


module.exports = router