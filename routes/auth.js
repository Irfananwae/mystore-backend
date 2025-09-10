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

// --- MODIFIED: Login Route with DEBUGGING LOGS ---
router.post('/login', async (req, res) => {
    try {
        // --- DEBUG LINE 1: See what the server receives ---
        console.log("--- New Login Attempt ---");
        console.log("Request Body:", req.body); 

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // --- DEBUG LINE 2: See if the user was found in the DB ---
        console.log("User found in DB:", user); 

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (user not found)' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        // --- DEBUG LINE 3: See if the password comparison was successful ---
        console.log("Password match result:", isMatch); 

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
        }

        // --- Create tokens ---
        const payload = { user: { id: user.id } };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION 
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION 
        });

        res.json({
            accessToken,
            refreshToken,
            ownerName: user.ownerName,
            shopName: user.shopName
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh Token Route (No changes needed)
router.post('/refresh', (req, res) => {
    // ... code for refresh ...
});

module.exports = router;
