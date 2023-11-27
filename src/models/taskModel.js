const mongoose = require('mongoose')


const taskSchema =new  mongoose.Schema({

    title:{
      type : String,
      required : true
    },
    description:{
        type : String,
        required : true

    },
    status:{
        type : String,
        enum: [
            "pending",
            "failed",
            "completed"
        ],
        default:"pending",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
})



const task  = mongoose.model('Task',taskSchema)

module.exports = task