import { useCallback, useEffect, useState } from 'react'
import {
    useGetGameDataMutation,
    useSaveGameDataMutation,
} from '../services/roomService'
import { useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'

const Game = (roomId) => {
    const { userInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()

    // game config
    // categories
    const [country, setCountry] = useState(null)
    const [city, setCity] = useState(null)

    const [saveGameData] = useSaveGameDataMutation()
    const handleSaveGameData = useCallback(async () => {
        try {
            const dataObject = {
                roomId: roomId?.roomId,
                nickname: userInfo?.nickname,
                data: [
                    {
                        category: 'Panstwo',
                        answer: country,
                    },
                    {
                        category: 'Miasto',
                        answer: city,
                    },
                ],
            }

            const res = await saveGameData(dataObject)
            console.log(res)
        } catch (err) {
            console.log(err)
        }
    }, [saveGameData, roomId, userInfo, country, city])

    const [gameData, setGameData] = useState(null)
    const [getGameData] = useGetGameDataMutation()
    const handleGetGameData = useCallback(async () => {
        try {
            const res = await getGameData(roomId?.roomId).unwrap()
            console.log(res)
            setGameData(res)
        } catch (err) {
            console.log(err)
        }
    }, [getGameData, roomId])

    const [counter, setCounter] = useState(10)
    const timer = useCallback(() => {
        let num = 9
        const intervalRef = setInterval(() => {
            if (num >= 0) {
                setCounter(num)
                console.log(num)
                num--
            } else {
                clearInterval(intervalRef)
            }
        }, 1000)
    }, [setCounter])

    const [game, setGame] = useState(false)
    const [character, setCharacter] = useState(null)

    // on start the game emit startGame to all room's clients
    const onStartGame = () => {
        socket.emit('startGame', { roomId: roomId?.roomId })
    }

    // start the game
    useEffect(() => {
        const handleStartGame = (randomCharacter) => {
            console.log('game starts! ', randomCharacter)
            setCharacter(randomCharacter)
            timer()
            setGame(true)
        }

        socket.on('startGameRoom', (randomCharacter) =>
            handleStartGame(randomCharacter)
        )
        return () => socket.off('startGameRoom', handleStartGame)
    }, [socket, timer, setCharacter, setGame])

    // end the game
    useEffect(() => {
        const handleEndGame = () => {
            console.log('game ends!  ')

            // save user answers
            handleSaveGameData()

            setGame(false)

            // fetch all game data and display game results
            handleGetGameData()
        }

        socket.on('endGameRoom', handleEndGame)
        return () => socket.off('endGameRoom', handleEndGame)
    }, [socket, handleSaveGameData, handleGetGameData, setGame])

    return (
        <>
            <div className="game-box-center">
                {!game && <button onClick={onStartGame}>Start</button>}

                {!game && gameData && (
                    // round results
                    <div>
                        {gameData?.gameData?.map((item, index) => (
                            <div key={index}>
                                <h1>{item?.nickname}</h1>
                                {item?.data?.map((category, index) => (
                                    <h4 key={index}>
                                        {category?.category}: {category?.answer}
                                    </h4>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {game && (
                    <>
                        <div>{counter}</div>
                        <div>
                            <h1>{character}</h1>
                        </div>

                        {/* game box */}
                        <div className="game-box">
                            <form>
                                <input
                                    type="text"
                                    placeholder="Panstwo"
                                    onChange={(e) => {
                                        setCountry(e.target.value)
                                    }}
                                />

                                <input
                                    type="text"
                                    placeholder="Miasto"
                                    onChange={(e) => {
                                        setCity(e.target.value)
                                    }}
                                />
                            </form>

                            {/* <button onClick={saveValues}>Ready</button> */}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default Game
