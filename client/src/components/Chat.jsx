import { useEffect, useState } from 'react'
import './chat.css'
import { useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'

const Chat = (roomId) => {
    const { userInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()

    // chat config
    const [message, setMessage] = useState('')
    const [chatData, setChatData] = useState([])

    // send meesage
    const handleSendMessage = (e) => {
        e.preventDefault()
        setChatData((data) => [
            ...data,
            { message, sender: userInfo?.nickname },
        ])

        //send real-time message
        socket.emit('sendRoomMessage', {
            user: userInfo?.nickname,
            roomId: roomId?.roomId,
            message,
        })

        setMessage('')
    }

    // receive message
    useEffect(() => {
        socket.on('receiveRoomMessage', (data) => {
            setChatData((list) => [...list, data])
        })
        return () => socket.off()
    }, [socket, setChatData])

    return (
        <>
            <div className="chat-box">
                {/* chat box */}
                <div style={{ width: '100%', height: '100%' }}>
                    {chatData?.map((msg, index) => (
                        <h4
                            className="chat-text"
                            key={index}
                        >{`${msg?.sender}: ${msg?.message}`}</h4>
                    ))}
                </div>
            </div>

            {/* message box */}
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    onChange={(e) => {
                        setMessage(e.target.value)
                    }}
                    value={message}
                />
                <button>Send</button>
            </form>
        </>
    )
}

export default Chat
