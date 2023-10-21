const Room = require('../models/Room')

const room_create = async (req, res) => {
    try {
        const { id, categories } = req.body

        const room = new Room({
            roomId: id,
            gameData: [],
            gamePoints: [],
        })

        const savedRoom = await room.save()
        if (!savedRoom) return res.status(400).json({ message: 'err' })
        res.status(200).json(id)
    } catch (err) {
        console.log(err)
    }
}

const room_user_join = async (req, res) => {
    try {
        const { nickname, roomId } = req.body

        // add to gameData arr
        const userGameDataObject = {
            nickname,
            answers: [],
        }

        // add to gamePoints arr
        const userGamePointsObject = {
            nickname,
            points: 0,
        }

        const roomCurr = await Room.findOne({ roomId })

        // check if user data already exists
        if (roomCurr) {
            console.log(roomCurr)
            let userExists = false
            roomCurr.gameData.forEach((data) => {
                if (data?.nickname === nickname) {
                    return (userExists = true)
                }
            })

            console.log(userExists)

            if (!userExists) {
                roomCurr.gameData = [...roomCurr?.gameData, userGameDataObject]
                roomCurr.gamePoints = [
                    ...roomCurr?.gamePoints,
                    userGamePointsObject,
                ]

                await roomCurr.save()
            }
        }
    } catch (err) {
        console.log(err)
    }
}

const room_data_save = async (req, res) => {
    try {
        const { roomId, nickname, data } = req.body
        console.log(roomId, nickname, ...data)

        // find room by roomId
        const room = await Room.findOne({ roomId })
        console.log(room)

        // update gameData
        const userGameDataObject = {
            round: '1',
            nickname,
            data,
        }

        room.gameData = [...room?.gameData, userGameDataObject]
        await room.save()

        // const room = new Room({
        //     roomId: id,
        //     users: [],
        //     categories,
        // })

        // const savedRoom = await room.save()
        // if (!savedRoom) return res.status(400).json({ message: 'err' })
        res.status(200)
    } catch (err) {
        console.log(err)
    }
}

const room_data_get = async (req, res) => {
    try {
        const { roomId } = req.params
        console.log(roomId)

        // find room by roomId
        const room = await Room.findOne({ roomId })
        console.log(room)

        if (!room) return res.status(400).json({ message: 'err' })
        res.status(200).json(room)
    } catch (err) {
        console.log(err)
    }
}

const room_id_get = async (req, res) => {
    try {
        const { id } = req.params
        // const room = await Room.findOne({ roomId: id })
        // console.log(room)

        // if (!room) return res.status(400).json({ message: 'err' })
        // res.status(200).json(room)
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    room_create,
    room_user_join,
    room_data_save,
    room_data_get,
    room_id_get,
}
