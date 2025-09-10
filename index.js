const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routers
const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const billRouter = require('./routes/bills');
const dashboardRouter = require('./routes/dashboard');
const customerRouter = require('./routes/customers');
// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
    console.error("MongoDB URI not found. Please set MONGO_URI in your .env file.");
    process.exit(1);
}
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- THIS IS THE CRITICAL HEALTH CHECK ENDPOINT ---
// It is included here and is essential for the UptimeRobot service.
app.get('/health', (req, res) => {
    res.status(200).send("Server is awake and healthy.");
});

// Root route for basic testing
app.get('/', (req, res) => {
    res.send('Welcome to the MyStoreApp Backend API!');
});

// API Routes
app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/bills', billRouter);
app.use('/dashboard', dashboardRouter);
app.use('/customers', customerRouter);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} and is accessible on your network`);
});
