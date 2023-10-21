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
const { randomCharacter } = require('./config/GameConfig')

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
            socket.join(roomId)

            console.log(
                `${socket.userId} ${socket.id} has been added to the Room ${roomId}`
            )
        })

        // on room message
        socket.on('sendRoomMessage', ({ user, roomId, message }) => {
            console.log(user, roomId, message)
            socket.to(roomId).emit('receiveRoomMessage', {
                message,
                sender: user,
            })
        })

        // on start the game
        socket.on('startGame', ({ roomId }) => {
            // start round for all room's clients
            const character = randomCharacter()
            socket.nsp.to(roomId).emit('startGameRoom', character)

            // start round and emit end of the round after 10 seconds
            setTimeout(() => {
                socket.nsp.to(roomId).emit('endGameRoom')
            }, 10000)
        })

        // disconnection event
        socket.on('disconnect', () => {
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
