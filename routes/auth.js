const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /auth/signup
router.post('/signup', async (req, res) => {
    console.log("--- SIGNUP REQUEST RECEIVED ---");
    console.log("Request Body:", req.body);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("Signup failed: Missing email or password.");
            return res.status(400).json({ message: "Email and password are required." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        console.log("Signup successful for:", email);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("---!!! SIGNUP ERROR !!!---", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already in use." });
        }
        res.status(500).json({ message: "Server error during signup." });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    console.log("--- LOGIN REQUEST RECEIVED ---");
    console.log("Request Body:", req.body);
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login failed: User not found for email:", email);
            return res.status(401).json({ message: "Authentication failed" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log("Login successful for:", email);
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.status(200).json({ message: "Login successful", token: token });
        } else {
            console.log("Login failed: Invalid password for email:", email);
            res.status(401).json({ message: "Authentication failed" });
        }
    } catch (error) {
        console.error("---!!! LOGIN ERROR !!!---", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// Middleware (no changes needed)
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.userData = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Auth failed' });
    }
};

module.exports = { router, verifyToken };
