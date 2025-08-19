const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Make sure this path is correct
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        // This will log the actual error to the Render console
        console.error("SIGNUP ERROR:", error); 
        res.status(500).json({ message: "Server error during signup. Check logs." });
    }
});

// POST /auth/login - Log in and return a JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Authentication failed: User not found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // Create a token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" } // Token expires in 7 days
            );
            res.status(200).json({
                message: "Login successful",
                token: token
            });
        } else {
            res.status(401).json({ message: "Authentication failed: Invalid password" });
        }
    } catch (error) {
        // This will log the actual error to the Render console
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Server error during login. Check logs." });
    }
});

module.exports = { router };
