const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')
const roomRoutes = require('./routes/roomRoutes')
const http = require('http')
const dbConnect = require('./config/DatabaseConfig')
const Room = require('./models/Room')
const room = require('./models/Room')
const {
    randomCharacter,
    saveRoundResults,
    calculateGamePoints,
    clientDisconnect,
} = require('./config/GameConfig')

dotenv.config()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const server = http.createServer(app)

const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        // origin: 'https://socialcloudclient.onrender.com',
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
})
io.use((socket, next) => {
    const userId = socket.handshake.auth.userId
    if (!userId) {
        return next(new Error('invalid userId'))
    }
    socket.userId = userId
    next()
})
io.on('connection', async (socket) => {
    try {
        // connection event
        console.log('user connected: ', socket.userId, socket.id)

        // on room join
        socket.on('roomJoin', async ({ roomId }) => {
            const room = await Room.findOne({ roomId })
            if (!room)
                return (
                    console.log('no room found'),
                    socket.emit('roomJoinData', {
                        error: 'no room found',
                    })
                )

            if (room?.roomJoinable) {
                // join socket client to the room
                socket.join(roomId)

                // check if user nickname is already in tha clients array
                let isClient = false
                room?.clients?.forEach((client) => {
                    if (client === socket.userId) return (isClient = true)
                })

                // add user nickname to the database clients array
                if (!isClient) {
                    room.clients.push(socket.userId)
                    await Room.findByIdAndUpdate(
                        { _id: room._id },
                        { clients: room.clients }
                    )

                    socket.emit('roomJoinData', {
                        room,
                        message: 'user joined the room',
                    })

                    console.log(
                        `${socket.userId} ${socket.id} has joined Room ${roomId}`
                    )
                }

                if (isClient) {
                    socket.emit('roomJoinData', {
                        room,
                        message: 'user re-joined the room',
                    })

                    console.log(
                        `${socket.userId} ${socket.id} has re-joined Room ${roomId}`
                    )
                }
            }

            if (!room?.roomJoinable) {
                // check if user client was in the game
                let isClient = false
                room.clients.forEach((client) => {
                    if (client === socket.userId) {
                        socket.join(roomId)
                        isClient = true

                        socket.emit('roomJoinData', {
                            room,
                            message: 'user re-joined the room',
                        })

                        console.log(
                            `${socket.userId} ${socket.id} has re-joined Room ${roomId}`
                        )
                    }
                })

                if (!isClient) {
                    socket.emit('roomJoinData', {
                        error: 'cannot join the room, game has already started',
                    })
                    console.log('cannot join the room, game has aleady started')
                }
            }
        })

        // on room message
        socket.on('sendRoomMessage', ({ user, roomId, message }) => {
            socket.to(roomId).emit('receiveRoomMessage', {
                message,
                sender: user,
            })
        })

        // on start the game / on next round start
        socket.on('startGame', async ({ roomId }) => {
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

            // start round and send updated room data to all room's clients
            const character = randomCharacter()
            socket.nsp
                .to(roomId)
                .emit('startGameRoom', { character, roomUpdate })

            // start round and emit end of the round after 10 seconds
            setTimeout(async () => {
                const res = await Room.findOne({ roomId })

                socket.nsp.to(roomId).emit('endGameRoom', res)
            }, 10000)
        })

        // on round answers
        socket.on('roundAnswers', (dataObject) => {
            console.log('round answers: ', dataObject)

            socket.nsp
                .to(dataObject?.roomId)
                .emit('roundAnswersServer', dataObject)
        })

        // on round results (reviewed answers)
        socket.on('roundResults', (dataObject) => {
            // save round data to da database
            saveRoundResults(dataObject?.roomId, dataObject?.roundResults)
        })

        socket.on('gamePoints', async (roomId) => {
            const gamePoints = await calculateGamePoints(roomId.roomId)
            socket.nsp.to(roomId?.roomId).emit('gamePointsServer', gamePoints)
        })

        // on game restart
        socket.on('restartGame', async ({ roomId }) => {
            const room = await Room.findOne({ roomId })
            if (!room) return console.log('no room found')

            const roomRestart = await Room.findByIdAndUpdate(
                { _id: room._id },
                { roomJoinable: true, roundNumber: 0, gameData: [] },
                { new: true }
            )

            socket.nsp.to(roomId).emit('restartGameRoom', roomRestart)
        })

        // disconnection event
        socket.on('disconnect', () => {
            clientDisconnect(socket.userId)
            console.log('user disconnected: ', socket.userId)
        })
    } catch (err) {
        console.log(err)
    }
})

server.listen(3000, () => {
    console.log('server works')
})
dbConnect()

//routes
app.use(authRoutes)
app.use(roomRoutes)
