const mongoose = require('mongoose')
require('dotenv').config()
DB_URI = process.env.DB_URI

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(DB_URI)
        if (conn) console.log('server has been connected to the db')
    } catch (err) {
        console.log(err)
    }
}

module.exports = dbConnect

// const rooms = []
// const roomAddUser = (roomId, user) => {
//     console.log('add ', user, 'to ', roomId)

//     rooms?.map((room) => {
//         if (room.id === roomId) {
//             console.log(room)

//             if (room.users.length === 0) room.users.push(user)

//             room?.users?.map((u) => {
//                 if (u?.nickname !== user?.nickname) {
//                     // add user to the room
//                     room.users.push(user)
//                 }
//             })
//         }

//         // console.log('user list has been updated: ', room)
//     })
// }

// module.exports = {
//     rooms,
//     roomAddUser,
// }
