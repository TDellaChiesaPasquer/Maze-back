const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: '24h'}) 
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded)=> {
        if (err) {
            return res.sendStatus(403).send('Token invalid');
        }
        req.user = decoded.user;
        console.log(req.user);
        next();
    })
}

module.exports = {generateAccessToken, authenticateToken};