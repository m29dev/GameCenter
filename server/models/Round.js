const mongoose = require('mongoose')

const roundSchema = mongoose.Schema({
    roundNumber: { type: Number, required: true }, // 1-10
    roomId: { type: String, required: true }, // e 123
    roundData: {
        type: Array,
        default: [],
    },
})

const round = mongoose.model('round', roundSchema)
module.exports = round
