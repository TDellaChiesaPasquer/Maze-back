const jwt = require('jsonwebtoken');

//The functions for JWT identification

function generateAccessToken(username) {        //Generates a token for 24h, stores the username of the user
    return jwt.sign({username}, process.env.TOKEN_SECRET, {expiresIn: '24h'}) 
}

function authenticateToken(req, res, next) {        //Identify the token, and puts the username in the request
    const token = req.headers['authorization'];
    if (token == null) {
        return res.json({result: false, error: 'Please login.'});   //No custom status to not have an error in the client console
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