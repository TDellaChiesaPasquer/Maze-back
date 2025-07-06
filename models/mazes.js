const mongoose = require('mongoose');
const {isSolvable2} = require('../modules/mazeAlgo');
require('./connection');

const mazeSchema = mongoose.Schema({
    grid: {
        type: [[String]],
        validate: {
            validator: isSolvable2,
            message: 'The maze is invalid'
        },
        required: [true, 'Please enter a maze']
    },
    idCustom: {
        type: Number,
        required: true,
        index: true
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