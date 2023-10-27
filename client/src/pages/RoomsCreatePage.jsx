import { useEffect, useState } from 'react'
import { useRoomCreateMutation } from '../services/roomService'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearGameInfo } from '../redux/authSlice'
import { Button } from 'react-bootstrap'

const RoomsCreatePage = () => {
    const { userInfo } = useSelector((state) => state.auth)
    let categories = ['Panstwa', 'Miasta']
    const [roundQuantity, setRoundQuantity] = useState(1)
    const [roomName, setRoomName] = useState('')
    const disptach = useDispatch()
    const navigate = useNavigate()

    const min = 1
    const max = 10
    const handleChange = (event) => {
        const value = Math.max(min, Math.min(max, Number(event.target.value)))
        setRoundQuantity(value)
    }

    useEffect(() => {
        if (!userInfo) {
            navigate('/auth')
        }
    })

    const [roomCreate] = useRoomCreateMutation()
    const onRoomCreate = async () => {
        try {
            const res = await roomCreate({
                id: roomName,
                roundQuantity,
            }).unwrap()
            console.log(res)

            disptach(clearGameInfo())
            navigate(`/rooms/${res}`)
        } catch (err) {
            console.log(err?.data?.message)
            window.alert(err?.data?.message)
        }
    }
    return (
        <>
            <form className="form-container">
                <input
                    className="form-container-input"
                    type="number"
                    placeholder="Rounds quantity (1-10)"
                    value={roundQuantity}
                    onChange={handleChange}
                />
            </form>

            <form
                className="form-container"
                onSubmit={(e) => {
                    e.preventDefault()
                    onRoomCreate()
                }}
            >
                <input
                    className="form-container-input"
                    type="text"
                    placeholder="Room ID"
                    onChange={(e) => {
                        setRoomName(e.target.value)
                    }}
                    value={roomName}
                />

                {/* for submit feature */}
                <button style={{ display: 'none' }}></button>

                <Button
                    variant="dark"
                    disabled={roomName ? false : true}
                    className="form-container-btn"
                >
                    Create room
                </Button>
            </form>

            <hr />

            {categories?.map((item, index) => (
                <h4 key={index}>{item}</h4>
            ))}
        </>
    )
}

export default RoomsCreatePage
