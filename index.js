const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routers
const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const billRouter = require('./routes/bills');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => {
    res.status(200).send("Server is awake and healthy.");
});

app.get('/', (req, res) => {
    res.send('Welcome to the MyStoreApp Backend API!');
});

// API Routes
app.use('/auth', authRouter); // This will now work correctly
app.use('/products', productRouter);
app.use('/bills', billRouter);
app.use('/dashboard', dashboardRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
