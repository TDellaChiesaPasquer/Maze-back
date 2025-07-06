const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {body, param, validationResult} = require('express-validator');
const {authenticateToken} = require('../modules/jwt');
const {isGrid, paramsValid} = require('../modules/mazeAlgo');
const {getNextMaxId, getRandomId} = require('../modules/mazeIndex');
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
        console.log(user.mazeList);
        if ((user.mazeList !== undefined) && user.mazeList.length >= 10) {
            return res.json({result: false, error: 'You already have the maximum number of mazes registered'})
        }
        const {hideWalls, hidePath, hideExit} = req.body.params;
        const newMaze = new Maze({grid: req.body.grid, hideWalls, hidePath, hideExit, creator: user._id, idCustom: getNextMaxId()[0]});
        const test = await newMaze.save();
        await User.findByIdAndUpdate(user._id, {$push: {mazeList: test._id}})
        res.json({result: true, data: test});
    } catch (error) {
        console.log(error)
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

function isMazeList(data) {
    if (!Array.isArray(data)) {
        return false;
    }
    return !data.some(element => typeof element !== 'number');
}

router.post('/random',
    body('mazeList').custom(isMazeList),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        const mazeIdList = await getRandomId(10, req.body.mazeList);
        const mazeList = await Maze.aggregate([
            {
                $match: {
                    idCustom: {$in: mazeIdList}
                }
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


router.get('/test', async (req, res) => {
    res.json({test: await getRandomId(10, [])})
})

function isNumber(value) {
    return Number(value) !== NaN;
}

router.get('/custom/:id', 
    param('id').isString().custom(isNumber),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: errors.array()});
            }
            const maze = await Maze.aggregate([
                {
                    $match: {idCustom: Number(req.params.id)}
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