import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
    const { userInfo } = useSelector((state) => state.auth)
    const [room, setRoom] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!userInfo) navigate('/auth')
    })

    return (
        <>
            <form>
                <h1>Welcome {userInfo?.nickname}</h1>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        navigate('/rooms/create')
                    }}
                >
                    Create room
                </button>
            </form>
            <hr />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    navigate(`/rooms/${room}`)
                }}
            >
                <input
                    type="text"
                    placeholder="Room ID"
                    onChange={(e) => {
                        setRoom(e.target.value)
                    }}
                    value={room}
                />
                <button>Join room</button>
            </form>
        </>
    )
}

export default HomePage
