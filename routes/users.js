const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/users');
const {body, validationResult} = require('express-validator');
const {generateAccessToken, authenticateToken} = require('../modules/jwt');


//Manages the routes related to users

router.post('/signup',          //The route to create an account
    body('email').trim().escape().notEmpty().isEmail(),
    body('password').isString().escape().isLength({min: 8, max: 32}),
    body('username').isString().escape().isLength({min: 3, max: 20}),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({result: false, error: errors.array()});
        }
        let possibleUser = await User.findOne({email: req.body.email});     //Verifies if an account with the same email exists
        if (possibleUser) {
            return res.json({result: false, error: 'The email is already taken'});
        }
        possibleUser = await User.findOne({username: req.body.username});   //Verifies if an account with the same username exists
        if (possibleUser) {
            return res.json({result: false, error: 'The username is already taken'});
        }
        const salt = await bcrypt.genSalt(saltRounds);
        const secPass = await bcrypt.hash(req.body.password, salt);         //Hash the password with a salt
        const newUser = new User({
            email: req.body.email,
            password: secPass,
            username: req.body.username,
            mazeList: []
        })
        await newUser.save();
        const token = generateAccessToken(req.body.username);
        return res.json({result: true, token});         //Returns a jwt to the user
    } catch (error) {
        console.log(error)
        return res.status(500).send('Erreur du serveur');
    }
})

router.post('/signin',      //The route to login to an account
    body('password').isString().escape().isLength({max: 32}),
    body('username').isString().escape().isLength({max: 20}),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        const possibleUser = await User.findOne({username: req.body.username}).select('password');      //Gets the hashed password
        if (!possibleUser) {        //Verifies if the user exists
            return res.json({result: false, error: 'The username or the password is wrong'});
        }
        const passwordCompare = await bcrypt.compare(req.body.password, possibleUser.password);     //Verifies if the password is good
        if (!passwordCompare) {
            return res.json({result: false, error: 'The username or the password is wrong'});
        }
        const token = generateAccessToken(req.body.username);
        return res.json({result: true, token})      //Returns a jwt token
    } catch (error) {
        console.log(error);
        return res.status(500).json('Erreur du serveur');
    }})

router.get('/info', authenticateToken, async (req, res) => {        //The route to get the data related to a user (including its collection of mazes)
    try {
        const data = await User.findOne({username: req.username}).populate('mazeList');     //Populate the mazeList
        if (!data) {
            return res.status(500).json({result: false, error: 'Erreur du serveur'});
        }
        return res.json({result: true, user: data})
    } catch (error) {
        console.log(error);
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

module.exports = router;
