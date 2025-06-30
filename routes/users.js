const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/users');
const {body, validationResult} = require('express-validator');
const {generateAccessToken, authenticateToken} = require('../modules/jwt');

router.post('/signup', 
    body('email').trim().escape().notEmpty().isEmail(),
    body('password').isString().escape().isLength({min: 8, max: 32}),
    body('username').isString().escape().isLength({min: 3, max: 20}),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        let possibleUser = await User.findOne({email: req.body.email});
        if (possibleUser) {
            return res.json({result: false, error: 'The email is already taken'});
        }
        possibleUser = await User.findOne({username: req.body.username});
        if (possibleUser) {
            return res.json({result: false, error: 'The username is already taken'});
        }
        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            username: req.body.username
        })
        await newUser.save();
        res.json({result: true});
    } catch (error) {
        console.log(error)
        return res.status(500).send('Erreur du serveur');
    }
})

router.post('/signin',
    body('password').isString().escape().isLength({min: 8, max: 32}),
    body('username').isString().escape().isLength({min: 3, max: 20}),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const possibleUser = await User.findOne({username: req.body.username, password: req.body.password});
        if (!possibleUser) {
            return res.json({result: false, error: 'The username or the password is wrong'});
        }
        const token = generateAccessToken(req.body.username);
        res.json({result: true, token});
    } catch (error) {
        console.log(error);
        return res.status(500).send('Erreur du serveur');
    }})

router.get('/test', authenticateToken, (req, res)=> {
    res.json('test');
})

module.exports = router;
