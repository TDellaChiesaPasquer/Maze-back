const mongoose = require('mongoose');
const {isSolvable} = require('../modules/mazeAlgo');

const mazeSchema = mongoose.Schema({
    grid: {
        type: [[String]],
        validate: {
            validator: isSolvable,
            message: 'The maze is invalid'
        },
        required: [true, 'Please enter a maze']
    },
    hideWalls: {
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
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
})

const Maze = mongoose.model('mazes', mazeSchema);

module.exports = Maze;