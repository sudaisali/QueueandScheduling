const Queue = require('bull');
const { sendEmail } = require('./email');
const { Job } = require('../models/jobs');
const { failed } = require('../models/failed');
const emailJob = new Queue('Job');
const forgetPasswordJob = new Queue('ForgetPasswordJob');

const processEmailJob = async (job) => {
  
  try {
    await sendEmail(job.data);
    console.log(`process completed`);
  } catch (error) {
    await failed.create({
      jobid: job.id,
      email: job.data.email,
      message: job.data.subject,
      status: "failed"
    });
    console.error(`process failed with error: ${error.message}`);
    // Do not rethrow the error here
  }
};

const processForgetPasswordJob = async (job) => {
  try {
    await sendEmail(job.data);
    console.log(`process completed`);
  } catch (error) {
    await failed.create({
      jobid: job.id,
      email: job.data.email,
      message: job.data.subject,
      status: "failed"
    });
    console.error(`process failed with error: ${error.message}`);
    // Do not rethrow 
};
}
emailJob.process(async (job) => {
  try {
    // Save job details to MongoDB
    const state = await job.getState()
    await Job.create({
      jobid: job.id,
      email:job.data.email,
      message:job.data.subject,
      status: state
    });
    await processEmailJob(job);
    console.log(`Job details saved to MongoDB`);
  } catch (error) {
    console.error(`Error saving job details to MongoDB  ${error.message}`);
    
  }
});

// Forget password job processing
forgetPasswordJob.process(async (job) => {
  try {
    // Save job details to MongoDB
    const state = await job.getState();
    await Job.create({
      jobid: job.id,
      email: job.data.email,
      message: job.data.subject,
      status: state
    });
    await processForgetPasswordJob(job);
    console.log(`Forget Password Job details saved to MongoDB`);
  } catch (error) {
    console.error(`Error saving Forget Password job details to MongoDB  ${error.message}`);
  }
});

// Event handlers
emailJob
  .on('error', function (error) {
    console.error(`An error occurred: ${error.message}`);
  })
  .on('waiting',  function (jobId) {
    const job =  Job.getJob(jobId);

        // Access the state property of the job
        const state = job?.state;

        // Log the state and information about the waiting job
        console.log(state);
    console.log(`A Job with ID ${jobId} is waiting to be processed.`);
  
  })
  .on('completed', async function (job, result) {
    console.log(`Job ${job.id} completed! Result: ${result}`);
    console.log(await job.getState())
    // Remove the job from the Bull queue
    console.log(job.state)
    await job.remove();
    const state = await job.getState();
    console.log(state);

    // Remove Job from MongoDB
    await Job.findOneAndDelete({ jobid: job.id });

    console.log(`Job removed from both Bull and MongoDB`);
  })
  .on('failed', function (job, err) {
    console.error(`Job ${job.id} failed with reason: ${err.message}`);
  })
 
 


  forgetPasswordJob
  .on('error', function (error) {
    console.error(`An error occurred in Forget Password Job: ${error.message}`);
  })
  .on('completed', async function (job, result) {
    console.log(`Forget Password Job ${job.id} completed! Result: ${result}`);
    await job.remove();
    await Job.findOneAndDelete({ jobid: job.id });
    console.log(`Forget Password Job removed from both Bull and MongoDB`);
  });

module.exports = { emailJob , forgetPasswordJob }
