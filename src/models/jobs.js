const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobid:String,
  email:String,
  message:String,
  status:String
});


const Job = mongoose.model('Job', jobSchema);

module.exports = { Job };
