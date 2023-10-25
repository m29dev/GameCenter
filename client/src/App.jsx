import { useSelector } from 'react-redux'
import './App.css'
import { Outlet } from 'react-router-dom'
import Navbar from './components/navbar/NavbarComponent'
import Container from 'react-bootstrap/Container'

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
            <Navbar></Navbar>
            <Container className="container-box">
                <Outlet context={[socket]}></Outlet>
            </Container>
        </>
    )
}

export default App
