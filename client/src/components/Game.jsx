import { useCallback, useEffect, useState } from 'react'
import { useGetGameDataMutation } from '../services/roomService'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import { setGameInfo, setRoomInfo } from '../redux/authSlice'

const Game = (roomId) => {
    const { userInfo, roomInfo, gameInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()
    const dispatch = useDispatch()

    // game config
    // categories
    const [country, setCountry] = useState(null)
    const [city, setCity] = useState(null)

    const handleSaveGameData = useCallback(async () => {
        try {
            const dataObject = {
                roomId: roomId?.roomId,
                nickname: userInfo?.nickname,
                data: [
                    {
                        category: 'Panstwo',
                        answer: country ? country : '',
                    },
                    {
                        category: 'Miasto',
                        answer: city ? city : '',
                    },
                ],
            }

            dispatch(setGameInfo(dataObject))

            // const res = await saveGameData(dataObject)
            // console.log(res)
            setCountry(null)
            setCity(null)
        } catch (err) {
            console.log(err)
        }
    }, [roomId, userInfo, country, city, dispatch])

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
        const handleStartGame = (data) => {
            setCountry(null)
            setCity(null)
            console.log('game starts! ', data?.character)
            setCharacter(data?.character)
            dispatch(setRoomInfo(data?.roomUpdate))

            timer()
            setGame(true)
        }

        socket.on('startGameRoom', (data) => {
            handleStartGame(data)
        })
        return () => socket.off('startGameRoom', handleStartGame)
    }, [socket, timer, setCharacter, setGame, dispatch])

    // end the game
    useEffect(() => {
        const handleEndGame = (res) => {
            console.log('game ends!  ')

            // save user answers
            handleSaveGameData()

            setGame(false)

            console.log('fetched data: ', res)
        }

        socket.on('endGameRoom', handleEndGame)
        return () => socket.off('endGameRoom', handleEndGame)
    }, [socket, handleSaveGameData, handleGetGameData, setGame])

    // re-start the game
    useEffect(() => {
        const handleRestartGame = (roomRestart) => {
            setCountry(null)
            setCity(null)
            console.log('game has been restarted! ', roomRestart)
            dispatch(setRoomInfo(roomRestart))
            setCharacter(null)
            setGame(false)
        }

        socket.on('restartGameRoom', (roomRestart) => {
            handleRestartGame(roomRestart)
        })
        return () => socket.off('startGameRoom', handleRestartGame)
    }, [socket, timer, setCharacter, setGame, dispatch])

    return (
        <>
            <div className="game-box-center">
                {!game && <button onClick={onStartGame}>Start</button>}

                {/* {!game && gameData && (
                    // round results
                    <div>
                        {gameData?.gameData?.map((item, index) => (
                            <div key={index}>
                                <h1>{item?.nickname}</h1>
                                {item?.answers?.map((category, index) => (
                                    <h4 key={index}>
                                        {category?.category}: {category?.answer}
                                    </h4>
                                ))}
                            </div>
                        ))}
                    </div>
                )} */}

                {!game && gameInfo && (
                    // round results
                    <div>
                        <br />
                        <h1>Your answers in round {roomInfo?.roundNumber}</h1>
                        {gameInfo?.data?.map((item, index) => (
                            <div key={index}>
                                <h4>
                                    {item?.category}: {item?.answer}
                                </h4>
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
                        <div>Round {roomInfo?.roundNumber}</div>

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
