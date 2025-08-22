const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.authData = authData;
            next();
        });
    } else {
        res.sendStatus(403); // Forbidden
    }
}

module.exports = { verifyToken };
