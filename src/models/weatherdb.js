const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
    name: String,
    main: {
        temp: Number,
        humidity: Number,
    },
    wind: {
        speed: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

module.exports = WeatherData;
