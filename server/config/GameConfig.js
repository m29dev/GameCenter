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

const saveRoundResults = async (roomId, roundResults) => {
    try {
        const room = await Room.findOne({ roomId })

        // if gameData is not empty
        if (room.gameData.length > 0) {
            // if round array exists

            let roundArrayExists = false

            room.gameData.map((roundArray) => {
                if (roundArray.round === room.roundNumber) {
                    console.log('1. gameData not empty, 2. round array exists')

                    roundArrayExists = true

                    // found this round array, so data will be updated
                    roundArray.roundData?.map((userData) => {
                        roundResults?.map((roundUserData) => {
                            if (userData.nickname === roundUserData.nickname) {
                                // update for each category review array
                                userData.data.map((userItem) => {
                                    roundUserData.data.map((roundItem) => {
                                        if (
                                            userItem.category ===
                                            roundItem.category
                                        ) {
                                            // userItem?.review?.push(...roundItem?.review)
                                            roundItem.review = [
                                                ...roundItem?.review,
                                                ...userItem?.review,
                                            ]
                                        }
                                    })
                                })
                            }
                        })
                    })
                }
            })
            if (roundArrayExists) {
                await Room.findByIdAndUpdate(
                    { _id: room._id },
                    { gameData: roundResults }
                )
            }

            // if round array does not exist
            if (!roundArrayExists) {
                console.log(
                    '1. gameData not empty, 2. round array does not exist'
                )
                const gameDataRoundObject = {
                    round: room?.roundNumber,
                    roundData: [],
                }
                gameDataRoundObject.roundData = roundResults

                await Room.findByIdAndUpdate(
                    { _id: room._id },
                    { gameData: [...room.gameData, gameDataRoundObject] }
                )
            }
        }

        // if gameData is empty
        if (room.gameData.length === 0) {
            console.log('1. gameData is empty')

            const gameDataRoundObject = {
                round: room?.roundNumber,
                roundData: [],
            }
            gameDataRoundObject.roundData = roundResults

            await Room.findByIdAndUpdate(
                { _id: room._id },
                { gameData: gameDataRoundObject }
            )
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    randomCharacter,
    saveRoundResults,
}
