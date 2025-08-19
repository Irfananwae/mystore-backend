require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routers (Declared only ONCE) ---
const { router: authRouter } = require('./routes/auth');
const productsRouter = require('./routes/products');
const billsRouter = require('./routes/bills');

// --- API Routes ---
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/bills', billsRouter);


// --- Start Server ---
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
