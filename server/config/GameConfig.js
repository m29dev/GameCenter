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
    // 'V',
    'W',
    // 'X',
    // 'Y',
    'Z',
]

const randomCharacter = () => {
    let randomNum = Math.trunc(Math.random() * 22)
    let character = characters[randomNum]
    return character
}

const startGameConfig = async (roomId) => {
    try {
        // set roomJoinable status to false and increase round number value by 1
        const room = await Room.findOne({ roomId })
        if (!room) return console.log('no room found')
        if (room.roundNumber >= room?.roundQuantity)
            return console.log('max round reched')

        const roomUpdate = await Room.findByIdAndUpdate(
            { _id: room._id },
            { roomJoinable: false, roundNumber: room.roundNumber + 1 },
            { new: true }
        )
        const character = randomCharacter()
        const startGameObject = {
            character,
            roomUpdate,
        }

        console.log('start game config: ', startGameObject)

        return startGameObject
    } catch (err) {
        console.log(err)
    }
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
                                            userItem.review = [
                                                ...userItem.review,
                                                ...roundItem.review,
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
                    { gameData: room.gameData }
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
                { gameData: [gameDataRoundObject] }
            )
        }
    } catch (err) {
        console.log(err)
    }
}

const saveClientRoundReview = async (roomId, userId) => {
    try {
        const room = await Room.findOne({ roomId })

        // get current round
        currentRound = room?.roundNumber

        // add data to the roundReview arr, to the current round object
        // {round: x, reviews: ['userId']}

        // check if current round reviews arr exists
        let currRoundReviewsExists = false
        room?.roundReviews?.forEach(async (reviewObject) => {
            if (reviewObject?.round === currentRound) {
                // current round reviews arr exists, so update this one
                currRoundReviewsExists = true

                let alreadyReviewed = false
                reviewObject?.reviews.forEach((client) => {
                    if (client === userId) {
                        alreadyReviewed = true
                    }
                })

                if (!alreadyReviewed) {
                    reviewObject?.reviews.push(`${userId}`)
                }
            }
        })

        if (!currRoundReviewsExists) {
            // current round reviews arr does not exist, so create one
            const reviewObject = {
                round: currentRound,
                reviews: [],
            }
            reviewObject.reviews.push(`${userId}`)
            room?.roundReviews.push(reviewObject)
        }

        const savedRoom = await Room.findByIdAndUpdate(
            { _id: room._id },
            { roundReviews: room.roundReviews },
            { new: true }
        )

        console.log('1', savedRoom.clients)
        console.log('2', savedRoom.roundReviews[currentRound - 1].reviews)

        // check if all active players have sent their reviews, if so set var to true and next round will be played
        let allReviewsSend = false
        if (
            savedRoom.roundReviews[currentRound - 1].reviews.length ===
            savedRoom.clients.length
        ) {
            allReviewsSend = true
        }
        return allReviewsSend
    } catch (err) {
        console.log(err)
    }
}

const calculateGamePoints = async (roomId) => {
    try {
        const room = await Room.findOne({ roomId })
        const gamePoints = []

        // calculate points for each round for each player
        room.clients.forEach((client) => {
            const clientPointsObject = {
                nickname: client,
                points: 0,
            }
            console.log('-----------------------------------------------------')
            console.log('POINTS REVIEW FOR ', client)
            room.gameData.forEach((roundObject) => {
                roundObject.roundData.forEach((roundResults) => {
                    if (roundResults.nickname === client) {
                        roundResults.data.forEach((answerObject) => {
                            // if EMPTY ANSWER automatically 0 points
                            if (answerObject.answer === ('' || null)) {
                                // console.log('__________')
                                // console.log(answerObject.answer, ': 0 points')
                            } else {
                                // if ERROR REVIEWS more than half of all clients automatically 0 points
                                if (
                                    answerObject.review.length >=
                                    room.clients.length / 2
                                ) {
                                    // console.log('__________')
                                    // console.log(
                                    //     answerObject.answer,
                                    //     ': 0 points'
                                    // )
                                } else {
                                    // if client's answer is the same as one of the other's one => 10 points
                                    let foundSameAnswer = false
                                    roundObject.roundData.forEach(
                                        (anotherUsersRoundObject) => {
                                            if (
                                                anotherUsersRoundObject.nickname !==
                                                client
                                            ) {
                                                anotherUsersRoundObject.data.forEach(
                                                    (othersAnswerObject) => {
                                                        if (
                                                            othersAnswerObject.answer.toLowerCase() ===
                                                            answerObject.answer.toLowerCase()
                                                        ) {
                                                            foundSameAnswer = true
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    )

                                    if (foundSameAnswer) {
                                        // console.log('__________')
                                        // console.log(
                                        //     answerObject.answer,
                                        //     ': 10 points'
                                        // )

                                        clientPointsObject.points += 10
                                    } else {
                                        // console.log('__________')
                                        // console.log(
                                        //     answerObject.answer,
                                        //     ': 15 points (BONUS 5 points)'
                                        // )

                                        clientPointsObject.points += 15
                                    }
                                }
                            }
                        })
                    }
                })
            })

            gamePoints.push(clientPointsObject)
        })

        console.log(gamePoints)

        return gamePoints
    } catch (err) {
        console.log(err)
    }
}

const clientDisconnect = async (client) => {
    try {
        const rooms = await Room.find({})

        rooms.forEach((room) => {
            room.clients.forEach(async (roomClient) => {
                if (roomClient === client) {
                    updateClients = room.clients.filter((e) => e !== client)
                    await Room.findByIdAndUpdate(
                        { _id: room._id },
                        { clients: updateClients }
                    )
                }
            })
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    randomCharacter,
    startGameConfig,
    saveRoundResults,
    saveClientRoundReview,
    calculateGamePoints,
    clientDisconnect,
}
