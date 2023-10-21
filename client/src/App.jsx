import { useSelector } from 'react-redux'
import './App.css'
import { Outlet } from 'react-router-dom'

//init socket io
import { io } from 'socket.io-client'
const socket = io('http://localhost:3000', {
    autoConnect: false,
})

function App() {
    const { userInfo } = useSelector((state) => state.auth)
    socket.auth = { userId: userInfo?.nickname }
    socket.connect()

    return (
        <>
            <Outlet context={[socket]}></Outlet>
        </>
    )
}

export default App
