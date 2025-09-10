const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Signup Route (This is working, so no changes)
router.post('/signup', async (req, res) => {
    try {
        const { email, password, ownerName, shopName } = req.body;
        if (!email || !password || !ownerName || !shopName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, ownerName, shopName });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
});


// --- NEW LOGIN ROUTE WITH ULTIMATE DEBUGGING ---
router.post('/login', async (req, res) => {
    console.log('--- LOGIN ROUTE HIT ---'); // <<< STEP 1: Confirms the route is being called.
    try {
        console.log('Request body received:', req.body); // <<< STEP 2: Shows us exactly what the app sent.

        const { email, password } = req.body;
        if (!email || !password) {
            console.log('Login failed: Email or password was missing in the request body.');
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        console.log(`Searching for user with email: ${email}`); // <<< STEP 3: Confirms the email being used for the search.

        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login failed: No user found in database with that email.'); // <<< STEP 4A: Tells us if the user was not found.
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('User found in database. User object:', user); // <<< STEP 4B: Shows us the user object if found.

        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Login failed: Password comparison returned false.'); // <<< STEP 5A: Tells us if passwords do not match.
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('Password comparison successful!'); // <<< STEP 5B: Confirms a successful password match.

        // If we reach here, login is successful. Now creating tokens.
        const payload = { user: { id: user.id } };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '90d' });

        console.log('Tokens created successfully. Sending response to user.');
        res.json({
            accessToken,
            refreshToken,
            ownerName: user.ownerName,
            shopName: user.shopName
        });

    } catch (error) {
        // <<< THIS IS THE MOST IMPORTANT PART. IT WILL SHOW US ANY CRASHES.
        console.error('!!!!!!!!!! CATCH BLOCK ERROR IN LOGIN ROUTE !!!!!!!!!!');
        console.error(error);
        res.status(500).json({ message: 'A critical server error occurred.' });
    }
});


// Refresh Token Route (No changes)
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
        const payload = { user: { id: decoded.user.id } };
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        res.json({ accessToken: newAccessToken });
    });
});

module.exports = router;
