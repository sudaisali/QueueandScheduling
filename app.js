require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./src/router/authRouter')
const userRouter = require('./src/router/userRouter')
const taskRouter = require('./src/router/taskRouter')
const app = express()
app.use(express.json())
app.use('/api/auth',authRouter)
app.use('/api/admin',userRouter)
app.use('/api/admin/task', taskRouter)
const port = process.env.SERVER_PORT
mongoose.connect(process.env.DATABASE_CONNECTION_STRING)
.then(()=>{
    console.log("Connected with database")
    app.listen(port,()=>{
        console.log("Server is started")
    })
})
.catch(error=>console.log(error))

