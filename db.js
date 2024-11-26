const mongoose = require('mongoose');

// MongoDB connection string
const uri = process.env.MONGO_URL;

async function connectToDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB using Mongoose');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

module.exports = connectToDatabase;
