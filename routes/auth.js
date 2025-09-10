const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Signup Route (No changes needed here)
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

// --- MODIFIED: Login Route ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- NEW: Create TWO tokens instead of one ---
        const payload = { user: { id: user.id } };

        // 1. Create the short-lived Access Token
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION 
        });

        // 2. Create the long-lived Refresh Token
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION 
        });

        res.json({
            accessToken,    // Send both tokens
            refreshToken,   // to the client
            ownerName: user.ownerName,
            shopName: user.shopName
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- NEW: Refresh Token Route ---
// This new route will be used to get a new access token
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // If the refresh token is invalid or expired, the user MUST log in again
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // If the refresh token is valid, create a new access token
        const payload = { user: { id: decoded.user.id } };
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
        });

        res.json({ accessToken: newAccessToken });
    });
});

module.exports = router;
