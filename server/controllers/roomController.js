const Room = require('../models/Room')

const room_create = async (req, res) => {
    try {
        const { id, categories } = req.body

        // check if room with entered id already exists
        const checkRoom = await Room.findOne({ roomId: id })
        console.log(checkRoom)
        if (checkRoom)
            return res.status(400).json({
                message:
                    'room with entered ID already exists. Try again with another ID.',
            })

        const room = new Room({
            roomId: id,
            roomJoinable: true,
            roundNumber: 0,
            clients: [],
            gameData: [],
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
            let userExists = false
            roomCurr.gameData.forEach((data) => {
                if (data?.nickname === nickname) {
                    return (userExists = true)
                }
            })

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
        // console.log(nickname, ...data)

        console.log('update gameData: ', data)

        // find room by roomId
        const room = await Room.findOne({ roomId })
        if (!room) return res.status(400).json({ messega: 'no room found' })

        // console.log('update user game data')
        room.gameData.forEach((item) => {
            if (item.nickname === nickname) {
                item.answers = [...data]
                return
            }
        })

        await Room.findByIdAndUpdate(
            { _id: room._id },
            { gameData: room.gameData }
        )

        res.status(200)
    } catch (err) {
        console.log(err)
    }
}

const room_data_get = async (req, res) => {
    try {
        const { roomId } = req.params
        console.log('REQ GET_ROOM_DATA 1')
        // find room by roomId
        const room = await Room.findOne({ roomId })

        if (!room) return res.status(400).json({ message: 'err' })
        console.log('RES GET_ROOM_DATA 2')
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
