const mongoose = require('mongoose');

const FailedSchema = new mongoose.Schema({
  jobid:String,
  email:String,
  message:String,
  status:String
});


const failed = mongoose.model('Failed', FailedSchema);

module.exports = { failed };
