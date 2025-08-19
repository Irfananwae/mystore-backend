require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// --- Database Connection ---
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .then(() => console.log('DATABASE CONNECTION SUCCESSFUL')) // <-- The new message
    .catch(err => console.error('---!!! DATABASE CONNECTION FAILED !!!---', err));

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routers ---
const { router: authRouter } = require('./routes/auth');
const productsRouter = require('./routes/products');
const billsRouter = require('./routes/bills');

// --- API Routes ---
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/bills', billsRouter);

app.get('/', (req, res) => res.send('MyStoreApp Backend is running.'));

// --- Start Server ---
app.listen(PORT, () => console.log(`Server started successfully on port ${PORT}`));
