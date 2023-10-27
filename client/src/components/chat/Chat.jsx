import { useEffect, useRef, useState } from 'react'
import './chat.css'
import { useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import { Button } from 'react-bootstrap'

const Chat = (data) => {
    const { userInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()

    // chat config
    const [message, setMessage] = useState('')
    const [chatData, setChatData] = useState([])

    // send meesage
    const handleSendMessage = (e) => {
        e.preventDefault()
        if (message === '') return

        setChatData((data) => [
            ...data,
            { message, sender: userInfo?.nickname },
        ])

        //send real-time message
        socket.emit('sendRoomMessage', {
            user: userInfo?.nickname,
            roomId: data?.roomId,
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

    // on room join msg
    useEffect(() => {
        const handleJoinRoomMsg = (data) => {
            const msgObject = {
                server: true,
                sender: '',
                message: data?.message,
            }
            setChatData((list) => [...list, msgObject])
        }

        socket.on('roomJoinMsg', (data) => {
            handleJoinRoomMsg(data)
        })

        return () => socket.off()
    }, [socket])

    // on chat data update scoll chat
    const chatBox = useRef()
    useEffect(() => {
        chatBox.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatData])

    return (
        <>
            {/* chat navbar */}
            <div className="chat-navbar">Chat</div>

            {/* chat box */}
            <div className="chat-box">
                {chatData?.map((msg, index) =>
                    msg.server ? (
                        <h4 className="chat-text-server" key={index}>
                            {`${msg?.message}`}
                        </h4>
                    ) : (
                        <h4 className="chat-text" key={index}>
                            {`${msg?.sender}: ${msg?.message}`}
                        </h4>
                    )
                )}

                <div ref={chatBox}></div>
            </div>

            {/* message box */}
            <form className="form-container" onSubmit={handleSendMessage}>
                <input
                    className="form-container-input"
                    type="text"
                    placeholder="Write a message..."
                    onChange={(e) => {
                        setMessage(e.target.value)
                    }}
                    value={message}
                />
                <Button
                    className="form-container-btn"
                    variant="dark"
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </form>
        </>
    )
}

export default Chat
