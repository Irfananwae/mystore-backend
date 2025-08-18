// This line loads the environment variables (like the database URL)
// On Render, these variables are set in the dashboard, not from a .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Allows your Android app to make requests to this server
app.use(cors());
// Allows the server to understand JSON data sent in requests
app.use(express.json());


// --- Database Connection ---
// It's crucial that DATABASE_URL is set in your Render environment
if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined.");
    process.exit(1); // Exit the process with an error code
}

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error('Database Connection Error:', error));
db.once('open', () => console.log('Successfully Connected to the Database'));


// --- API Routes ---
// Any request that starts with /products will be handled by this router
const productsRouter = require('./routes/products');
app.use('/products', productsRouter);

// A simple root route to check if the server is running
app.get('/', (req, res) => {
    res.send('Grocery App Backend is running!');
});


// --- Start The Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server has started and is running on port ${PORT}`));
