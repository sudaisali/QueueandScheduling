const user = require('../models/UserModel')
const mongoose = require('mongoose')
require('dotenv').config()

const connectionString =process.env.DATABASE_CONNECTION_STRING 
console.log(connectionString)
mongoose.connect("mongodb://0.0.0.0:27017/UserAuthentication")


const Users = [
    {
        name:"sudais",
        email:"sudias@gmail.com",
        password:"user123456",
        confirmPassword:"user123456",
        role:"admin",
        isVerified:true

    }
]


const seedUser = async () => {
    try {
        for (const userData of Users) {
            await user.create(userData);
            console.log(`User ${userData.name} seeded successfully`);
        }
    } catch (error) {
        console.error('Error seeding users:', error);
    }
};

seedUser();