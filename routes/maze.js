const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {body, param, validationResult} = require('express-validator');
const {authenticateToken} = require('../modules/jwt');
const {isGrid, paramsValid} = require('../modules/mazeAlgo');
const Maze = require('../models/mazes');
const User = require('../models/users');
const mongoose = require('mongoose');

router.post('/', authenticateToken,
    body('grid').custom(isGrid),
    body('params').custom(paramsValid),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        const user = await User.findOne({username: req.username})
        if ((user.mazeList !== undefined) && user.mazeList.length >= 10) {
            return res.json({result: false, error: 'You already have the maximum number of mazes registered'})
        }
        const {hideWalls, hidePath, hideExit} = req.body.params;
        const newMaze = new Maze({grid: req.body.grid, hideWalls, hidePath, hideExit, creator: user._id});
        const test = await newMaze.save();
        console.log('test')
        res.json({result: true, data: test});
    } catch (error) {
        console.log(error)
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

router.get('/random', async (req, res, next) => {
    try {
        const mazeList = await Maze.aggregate([
            {
                $sample: {size: 10}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorInfo"
                }
            },
            {
                $addFields: {
                    'creatorUsernameArray': '$creatorInfo.username'
                }
            },
            {
                $addFields: {
                    'creatorUsername': {$arrayElemAt: ['$creatorUsernameArray', 0]}
                }
            },
            {
                $project: {
                    creatorInfo: 0,
                    creatorUsernameArray: 0
                }
            }
        ]);
        res.json({result: true, mazeList});
    } catch (error) {
        console.log(error)
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

router.get('/:id', 
    param('id').isString().escape().isLength({max: 50}),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: errors.array()});
            }
            const maze = await Maze.aggregate([
                {
                    $match: {_id: new mongoose.Types.ObjectId(req.params.id)}
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "creator",
                        foreignField: "_id",
                        as: "creatorInfo"
                    }
                },
                {
                    $addFields: {
                        'creatorUsernameArray': '$creatorInfo.username'
                    }
                },
                {
                    $addFields: {
                        'creatorUsername': {$arrayElemAt: ['$creatorUsernameArray', 0]}
                    }
                },
                {
                    $project: {
                        creatorInfo: 0,
                        creatorUsernameArray: 0
                    }
                }
            ])
            return res.json(Boolean(maze) ? {result: true, maze: maze[0]} : {result: false});
        } catch (error) {
            console.log(error)
            return res.status(500).json({result: false, error: 'Erreur du serveur'});
        }
    }
)

module.exports = router;