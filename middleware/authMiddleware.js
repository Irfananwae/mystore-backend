const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        
        // --- THIS IS THE FIX ---
        // We now use the correct secret to verify the token.
        jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
            if (err) {
                // This is why it was failing. The secrets didn't match.
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
