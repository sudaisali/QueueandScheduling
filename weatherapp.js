const axios = require('axios');
const cron = require('node-cron');
const mongoose = require('mongoose');
const WeatherData = require('./src/models/weatherdb');

// MongoDB connection details
const mongoUrl = 'mongodb://localhost:27017/weatherdb';

// OpenWeatherMap API details
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = '15a2b2ac8bff6285002efe86043c89be';
const lat = '31.5204';
const lon = '74.3587';

mongoose.connect(mongoUrl);


cron.schedule('*/1 * * * *', async () => {
    try {
        const weatherData = await fetchWeatherData();
        if (weatherData) {
            await saveToMongoDB(weatherData);
            console.log('Weather data saved to MongoDB.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
});

async function fetchWeatherData() {
    const params = {
        params: {
            lat: lat,
            lon: lon,
            appid: apiKey,
        },
    };

    try {
        const response = await axios.get(apiUrl, params);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

async function saveToMongoDB(data) {
    const weatherData = new WeatherData(data);

    try {
        await weatherData.save();
    } catch (error) {
        console.error('Error saving weather data to MongoDB:', error.message);
    }
}
