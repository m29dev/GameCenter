import { useState } from 'react'
import { useRoomCreateMutation } from '../services/roomService'
import { useNavigate } from 'react-router-dom'

const RoomsCreatePage = () => {
    let categories = ['Panstwa', 'Miasta']
    const [roomName, setRoomName] = useState('')
    const navigate = useNavigate()

    const [roomCreate] = useRoomCreateMutation()
    const onRoomCreate = async () => {
        try {
            const res = await roomCreate({ id: roomName, categories }).unwrap()
            console.log(res)

            navigate(`/rooms/${res}`)
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <>
            <h1>Set room name</h1>
            <input
                type="text"
                onChange={(e) => {
                    setRoomName(e.target.value)
                }}
                value={roomName}
            />

            <button disabled={roomName ? false : true} onClick={onRoomCreate}>
                Start Game
            </button>

            {categories?.map((item, index) => (
                <h4 key={index}>{item}</h4>
            ))}
        </>
    )
}

export default RoomsCreatePage
