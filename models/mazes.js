const mongoose = require('mongoose');
const {isSolvable} = require('../modules/mazeAlgo'); //Imports the custom validator, that verify if the maze is solvable
require('./connection');

//This collection stores the mazes


const mazeSchema = mongoose.Schema({
    grid: {
        type: [[String]],
        validate: {
            validator: isSolvable,
            message: 'The maze is invalid'
        },
        required: [true, 'Please enter a maze']
    },
    idCustom: {         //For the random route, making it faster to exclude the ones already sent to the user before, as the idCustom are given in order (1, 2, 3, ...)
        type: Number,
        required: true,
        index: true
    },
    hideWalls: {        //The optionnals settings for extra-difficulty
        type: Boolean,
        default: false
    },
    hidePath: {
        type: Boolean,
        default: false
    },
    hideExit: {
        type: Boolean,
        default: false
    },
    creator: {          //Represents the user that posted the maze
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const Maze = mongoose.model('mazes', mazeSchema);

module.exports = Maze;