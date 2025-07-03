const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: '24h'}) 
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) {
        return res.status(401).json({result: false, error: 'No token'});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded)=> {
        if (err) {
            return res.status(403).json({result: false, error: 'Token invalid'});
        }
        req.username = decoded.username;
        next();
    })
}

module.exports = {generateAccessToken, authenticateToken};