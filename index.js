// This line must be at the very top to load your .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
// Allows requests from your Android app
app.use(cors());
// Allows the server to understand JSON data in request bodies
app.use(express.json());

// --- Database Connection ---
// Check if the database URL is actually loaded
if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in your environment.");
    process.exit(1); // Exit the application if the database cannot be connected
}

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error('Database Connection Error:', error));
db.once('open', () => console.log('Successfully Connected to the Database'));

// --- API ROUTES ---
// This is the root route to check if the server is running
app.get('/', (req, res) => {
    res.send('Grocery App Backend API is running!');
});

// Products Router
const productsRouter = require('./routes/products');
app.use('/products', productsRouter);

// Authentication Router
// This correctly imports the 'router' object from auth.js
const { router: authRouter } = require('./routes/auth'); // Corrected import
const productsRouter = require('./routes/products');
const billsRouter = require('./routes/bills');

// ... (app.use(cors), app.use(express.json))

app.use('/auth', authRouter); // Corrected usage
app.use('/products', productsRouter);
app.use('/bills', billsRouter);

// --- Start The Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server has started and is running on port ${PORT}`));
