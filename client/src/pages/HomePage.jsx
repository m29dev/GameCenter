import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
    const { userInfo } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    useEffect(() => {
        if (!userInfo) navigate('/auth')
    })

    return (
        <>
            <h1>Welcome {userInfo?.nickname}</h1>
            <button
                onClick={() => {
                    navigate('/rooms/create')
                }}
            >
                Create room
            </button>
            <button>Join room</button>
        </>
    )
}

export default HomePage
