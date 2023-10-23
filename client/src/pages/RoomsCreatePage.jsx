import { useState } from 'react'
import { useRoomCreateMutation } from '../services/roomService'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearGameInfo } from '../redux/authSlice'

const RoomsCreatePage = () => {
    let categories = ['Panstwa', 'Miasta']
    const [roundQuantity, setRoundQuantity] = useState(5)
    const [roomName, setRoomName] = useState('')
    const disptach = useDispatch()
    const navigate = useNavigate()

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
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onRoomCreate()
                }}
            >
                <h1>Set rounds quantity</h1>
                <input
                    min={1}
                    max={10}
                    type="number"
                    value={roundQuantity}
                    onChange={(e) => {
                        setRoundQuantity(e.target.value)
                    }}
                />

                <h1>Set room name</h1>
                <input
                    type="text"
                    onChange={(e) => {
                        setRoomName(e.target.value)
                    }}
                    value={roomName}
                />

                <button disabled={roomName ? false : true}>Start Game</button>
            </form>
            <hr />

            {categories?.map((item, index) => (
                <h4 key={index}>{item}</h4>
            ))}
        </>
    )
}

export default RoomsCreatePage
