import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Chat from '../components/chat/Chat'
import Game from '../components/game/Game'
import './room.css'
import { useDispatch } from 'react-redux'
import { setRoomInfo } from '../redux/authSlice'

const RoomsIdPage = () => {
    const [socket] = useOutletContext()
    const [roomId, setRoomId] = useState(null)
    const [joinRoomMsg, setJoinRoomMsg] = useState(null)
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
                setJoinRoomMsg(data?.message)
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
                    <Chat roomId={roomId} joinRoomMsg={joinRoomMsg}></Chat>
                </div>

                <div className="room-box-center">
                    {/* roomnavbar */}
                    {/* <div className="room-navbar"></div> */}

                    {/* center  */}
                    <Game roomId={roomId}></Game>
                </div>
            </div>
        </>
    )
}

export default RoomsIdPage
