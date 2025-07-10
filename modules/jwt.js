const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: '24h'}) 
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) {
        return res.json({result: false, error: 'Please login.'});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded)=> {
        if (err) {
            return res.json({result: false, error: 'Your session is invalid. Please login again.'});
        }
        req.username = decoded.username;
        next();
    })
}

module.exports = {generateAccessToken, authenticateToken};