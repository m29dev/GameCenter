import { useSelector } from 'react-redux'
import './App.css'
import { Outlet } from 'react-router-dom'
import Container from 'react-bootstrap/Container'

//init socket io
import { io } from 'socket.io-client'
const socket = io('https://panstwamiastaserver.onrender.com', {
    autoConnect: false,
})

function App() {
    const { userInfo } = useSelector((state) => state.auth)
    socket.auth = { userId: userInfo?.nickname }
    socket.connect()

    return (
        <>
            <Container className="container-box">
                <Outlet context={[socket]}></Outlet>
            </Container>
        </>
    )
}

export default App
