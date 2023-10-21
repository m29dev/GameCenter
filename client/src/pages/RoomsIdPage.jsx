import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import Chat from '../components/chat'
import Game from '../components/Game'
import './room.css'
import { useRoomUserJoinMutation } from '../services/roomService'
import { useSelector } from 'react-redux'

const RoomsIdPage = () => {
    const { userInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()
    const [roomId, setRoomId] = useState(null)

    // get room ID from params
    const params = useParams()

    // room config
    const [roomUserJoin] = useRoomUserJoinMutation()
    const joinRoom = useCallback(async () => {
        const { id } = params
        setRoomId(id)

        // join user socket to the room
        socket.emit('roomJoin', {
            roomId: id,
        })

        // add user init objects to the database
        await roomUserJoin({
            nickname: userInfo?.nickname,
            roomId,
        }).unwrap()
    }, [params, setRoomId, socket, roomUserJoin, userInfo, roomId])

    // join room on init
    useEffect(() => {
        joinRoom()
    }, [joinRoom])

    return (
        <>
            <div className="room-box">
                {/* leftbar */}
                <div className="room-box-leftbar">
                    <Chat roomId={roomId}></Chat>
                </div>

                {/* center  */}
                <h1>Room ID: {roomId}</h1>
                <Game roomId={roomId}></Game>
            </div>
        </>
    )
}

export default RoomsIdPage
