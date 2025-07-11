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

//Manages the routes related to maze posting and getting (excluding the collection)

router.post('/', authenticateToken,     //The route to post a maze
    body('grid').custom(isGrid),
    body('params').custom(paramsValid),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {        //Verifies the given variables are good
            return res.status(400).json({error: errors.array()});
        }
        const user = await User.findOne({username: req.username});
        if ((user.mazeList !== undefined) && user.mazeList.length >= 50) {  //Verify the user doesn't have already too many mazes
            return res.json({result: false, error: 'You already have the maximum number of mazes registered'})
        }
        const {hideWalls, hidePath, hideExit} = req.body.params;
        const idCustom = await getNextMaxId()
        const newMaze = new Maze({grid: req.body.grid, hideWalls, hidePath, hideExit, creator: user._id, idCustom: idCustom[0]});
        const test = await newMaze.save();
        await User.findByIdAndUpdate(user._id, {$push: {mazeList: test._id}})
        res.json({result: true, data: test});
    } catch (error) {
        console.log(error)
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

function isMazeList(data) {         //Verify the arguement is an array of numbers
    if (!Array.isArray(data)) {
        return false;
    }
    return !data.some(element => typeof element !== 'number');
}

router.post('/random',      //The route to get random mazes, excluding those given in the body
    body('mazeList').custom(isMazeList),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({error: errors.array()});
        }
        const mazeIdList = await getRandomId(10, req.body.mazeList);
        const mazeList = await Maze.aggregate([     //Gets the mazes, populating them only with the usernames of the creators
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
        console.log(error);
        return res.status(500).json({result: false, error: 'Erreur du serveur'});
    }
})

function isNumber(value) {      //Verify the argument is a number
    return Number(value) !== NaN;
}

router.get('/custom/:id',       //The route to get a maze using its idCustom
    param('id').isString().custom(isNumber),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: errors.array()});
            }
            const maze = await Maze.aggregate([     //Gets the maze, populating it only with the username of the creator
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

router.get('/:id',      //The route to get a maze using its mongodb id
    param('id').isString().escape().isLength({max: 50}),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: errors.array()});
            }
            const maze = await Maze.aggregate([  //Gets the maze, populating it only with the username of the creator
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

router.delete('/custom/:id',        //The route to delete a maze using its idCustom
    authenticateToken,
    param('id').isString().custom(isNumber),
    async (req, res, next) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({error: errors.array()});
            }
            const possibleMaze = await Maze.findOne({idCustom: Number(req.params.id)}).populate('creator');     //Verify that the maze exists
            if (!possibleMaze) {
                await User.findOneAndUpdate({username: req.username}, {$pull: {mazeList : possibleMaze._id}}); //Gets the id out of the user mazeList, in the case there was a mistake
                return res.json({result: false, error: "The maze doesn't exist."})
            }
            if (possibleMaze.creator.username !== req.username) {       //Verify that the user is the creator of the maze
                await User.findOneAndUpdate({username: req.username}, {$pull: {mazeList : possibleMaze._id}}); //Gets the id out of the user mazeList, in the case there was a mistake
                return res.json({result: false, error: "The maze is not yours."})
            }
            await User.findOneAndUpdate({username: req.username}, {$pull: {mazeList : possibleMaze._id}}); //Gets the id out of the user mazeList
            await Maze.findByIdAndDelete(possibleMaze._id); //Deletes the maze
            return res.json({result: true});
        } catch (error) {
            console.log(error)
            return res.status(500).json({result: false, error: 'Erreur du serveur'});
        }
    }
)


module.exports = router;