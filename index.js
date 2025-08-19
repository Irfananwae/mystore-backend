require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas...', err));

// --- Middleware ---
// Allow requests from any origin
app.use(cors());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// --- Routers ---
const { router: authRouter } = require('./routes/auth');
const productsRouter = require('./routes/products');
const billsRouter = require('./routes/bills');

// --- API Routes ---
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/bills', billsRouter);

// --- Simple Welcome Route ---
app.get('/', (req, res) => {
    res.send('Welcome to the MyStoreApp Backend API!');
});

// --- Start Server ---
app.listen(PORT, () => console.log(`Server started and listening on port ${PORT}`));
