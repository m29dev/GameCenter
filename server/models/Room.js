const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    roomJoinable: {
        type: Boolean,
        required: true,
    },
    roundNumber: {
        type: Number,
        required: true,
    },
    roundQuantity: {
        type: Number,
        required: true,
    },
    clients: {
        type: Array,
        required: true,
    },
    gameData: {
        type: Array,
        required: true,
    },

    // gameData: {
    //     type: Array,
    //     default: [],
    // },
    // gamePoints: {
    //     type: Array,
    //     default: [],
    // },

    // game status, false - users can join, true - users cannot join
    // gameStarted: {
    //     type: Boolean,
    //     default: false,
    // },
})

const Room = mongoose.model('Room', roomSchema)
module.exports = Room
