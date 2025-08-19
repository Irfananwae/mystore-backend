const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /auth/signup - Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        if (error.code === 11000) {
             return res.status(409).json({ message: "Email already in use." });
        }
        res.status(500).json({ message: "Server error during signup" });
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
        if (await bcrypt.compare(password, user.password)) {
            // Create a token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" } // Token expires in 7 days
            );
            res.status(200).json({
                message: "Login successful",
                token: token, // Send the token to the client
                userId: user._id
            });
        } else {
            res.status(401).json({ message: "Authentication failed: Invalid password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
    try {
        // Get token from "Authorization: Bearer <token>"
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded; // Attach user data (userId, email) to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication Failed'
        });
    }
};

// You can now protect other routes like this:
// router.get('/protected-data', verifyToken, (req, res) => { ... });

module.exports = { router, verifyToken };
