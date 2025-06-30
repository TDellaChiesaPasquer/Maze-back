const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        index: true,
        validate: {
            validator: function(value) {
                return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value.toLowerCase());
            },
            message: 'Please enter a valide email'
        },
        trim: true
    },
    password: {
        type: String,
        select: false,
        required: [true, 'Please enter a password']
    },
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
    },
    mazeList: [{type: mongoose.Schema.Types.ObjectId, ref: 'mazes'}]
})

const User = mongoose.model('users', userSchema);

module.exports = User;