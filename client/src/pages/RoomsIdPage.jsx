import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Chat from '../components/chat/Chat'
import Game from '../components/game/Game'
import './room.css'
import { useDispatch, useSelector } from 'react-redux'
import { clearGameInfo, setRoomInfo } from '../redux/authSlice'
import { BsFillChatDotsFill } from 'react-icons/bs'

const RoomsIdPage = () => {
    const { userInfo, gameInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()
    const [roomId, setRoomId] = useState(null)
    const [joinRoomMsg, setJoinRoomMsg] = useState(null)
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [chatDisplayToggle, setChatDisplayToggle] = useState(false)

    // room config
    const joinRoom = useCallback(async () => {
        const { id } = params
        setRoomId(id)

        // join user socket to the room
        socket.emit('roomJoin', {
            roomId: id,
        })
    }, [params, setRoomId, socket])

    useEffect(() => {
        joinRoom()
    }, [joinRoom])

    // join room on init
    useEffect(() => {
        if (!userInfo) {
            navigate('/auth')
        }

        // if gameInfo.roomId !== this.roomId clear gameInfo
        const { id } = params
        if (gameInfo?.roomId !== id) {
            dispatch(clearGameInfo())
        }
    }, [navigate, dispatch, gameInfo, userInfo, params])

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

    const handleChatToggle = () => {
        setChatDisplayToggle(!chatDisplayToggle)
    }

    return (
        <>
            <div className="room-box">
                {/* on mobile screens */}
                <div className="chat-display-toggle" onClick={handleChatToggle}>
                    <BsFillChatDotsFill
                        color="FFFFFFDE"
                        style={{ width: '23px', height: '23px' }}
                    ></BsFillChatDotsFill>
                </div>

                {/* leftbar */}
                <div
                    className={
                        chatDisplayToggle
                            ? 'room-box-leftbar-mobile'
                            : 'room-box-leftbar'
                    }
                >
                    <Chat roomId={roomId} joinRoomMsg={joinRoomMsg}></Chat>
                </div>

                <div className="room-box-center">
                    <Game roomId={roomId}></Game>
                </div>
            </div>
        </>
    )
}

export default RoomsIdPage
