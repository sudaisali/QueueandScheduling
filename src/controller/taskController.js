const task = require('../models/taskModel')


const createTask = async(req,res)=>{
  try {
        const { title, description , status } = req.body;
        const newTask = new task({
            title,
            description,
            status     
        });
        
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const softDeleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const deletedTask = await task.findByIdAndUpdate(
            taskId,
            { isDeleted: true },
            { new: true } 
        );

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task soft deleted successfully', task: deletedTask });
    } catch (error) {
        console.error('Error soft deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await task.find({ isDeleted: false });

        res.json({ tasks });
    } catch (error) {
        console.error('Error retrieving tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = { createTask , softDeleteTask , getAllTasks};