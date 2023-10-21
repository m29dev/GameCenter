const Room = require('../models/Room')

const characters = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    // 'X',
    'Y',
    'Z',
]

const randomCharacter = () => {
    let randomNum = Math.trunc(Math.random() * 24)
    let character = characters[randomNum]
    return character
}

module.exports = {
    randomCharacter,
}
