import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Chat from '../components/chat'
import Game from '../components/Game'
import './room.css'
import { useDispatch } from 'react-redux'
import { setRoomInfo } from '../redux/authSlice'

const RoomsIdPage = () => {
    const [socket] = useOutletContext()
    const [roomId, setRoomId] = useState(null)
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // room config
    const joinRoom = useCallback(async () => {
        const { id } = params
        setRoomId(id)

        // join user socket to the room
        socket.emit('roomJoin', {
            roomId: id,
        })
    }, [params, setRoomId, socket])

    // join room on init
    useEffect(() => {
        joinRoom()
    }, [joinRoom])

    // on room join data event
    useEffect(() => {
        const handleRoomJoinData = (data) => {
            if (data?.message) {
                console.log(data?.message)
                dispatch(setRoomInfo(data?.room))
            }

            if (data?.error) {
                window.alert(data?.error)
                navigate('/home')
            }
        }

        socket.on('roomJoinData', (data) => handleRoomJoinData(data))

        return () => socket.off('roomJoinData', handleRoomJoinData)
    }, [socket, dispatch, navigate])

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
