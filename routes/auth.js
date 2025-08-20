const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Make sure the path to your user model is correct
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use." });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create and save the new user
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User created successfully" });

    } catch (error) {
        console.error("--- SIGNUP ERROR ---", error);
        res.status(500).json({ message: "Server error during signup." });
    }
});

// POST /auth/login - Log in and return a JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // Use a generic error for security (don't reveal if email exists)
            return res.status(401).json({ message: "Authentication failed: Invalid credentials" });
        }

        // 2. Compare the provided password with the stored hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // 3. If passwords match, create the JWT token
            const token = jwt.sign(
              { userId: user._id, email: user.email }, // Payload: Data to store in the token
              process.env.JWT_SECRET,                  // Your secret password from Render environment variables
              { expiresIn: "7d" }                       // Option: Set the token to expire in 7 days
            );

            // 4. Send the successful response with the token
            res.status(200).json({
                message: "Login successful",
                token: token
            });
        } else {
            // If passwords do not match, send the same generic error
            res.status(401).json({ message: "Authentication failed: Invalid credentials" });
        }
    } catch (error) {
        console.error("--- LOGIN ERROR ---", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

/**
 * Middleware to verify JWT on protected routes.
 * How to use: Add `verifyToken` to any route you want to protect.
 * Example: router.get('/my-products', verifyToken, (req, res) => { ... });
 */
const verifyToken = (req, res, next) => {
    try {
        // Get token from "Authorization: Bearer <token>" header
        const token = req.headers.authorization.split(" ")[1];
        // Check the token's signature against our secret
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user's data to the request for other routes to use
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        next(); // If token is valid, proceed
    } catch (error) {
        // If token is invalid or missing, send an error
        return res.status(401).json({ message: 'Authentication Failed' });
    }
};

module.exports = { router, verifyToken };
