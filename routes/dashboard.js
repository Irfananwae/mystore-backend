const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Bill = require('../models/bill');
const Product = require('../models/product');

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.authData = authData;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysBills = await Bill.find({ createdAt: { $gte: today } });

        let todaysCashSales = 0;
        let todaysOnlineSales = 0;
        todaysBills.forEach(bill => {
            if (bill.paymentMethod === 'Online') {
                todaysOnlineSales += bill.totalAmount;
            } else {
                todaysCashSales += bill.totalAmount;
            }
        });

        const topSellingProducts = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.name", totalQuantity: { $sum: "$items.quantity" } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        const lowStockProducts = await Product.find({ quantity: { $lte: 5 } })
            .sort({ quantity: 1 })
            .limit(5);

        res.json({
            todaysCashSales,
            todaysOnlineSales,
            todaysBillsCount: todaysBills.length,
            topSellingProducts,
            lowStockProducts
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
