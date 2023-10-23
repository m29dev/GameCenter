import { useCallback, useEffect, useState } from 'react'
import { useGetGameDataMutation } from '../services/roomService'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import { clearGameInfo, setRoomInfo } from '../redux/authSlice'
import ReviewAnswers from './ReviewAnswers'

const Game = (roomId) => {
    const { userInfo, roomInfo } = useSelector((state) => state.auth)
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
                        review: [],
                    },
                    {
                        category: 'Miasto',
                        answer: city ? city : '',
                        review: [], //boolean, each room's client set this later in the review
                    },
                ],
            }
            // send dataObject to the socket.io server
            socket.emit('roundAnswers', dataObject)

            // dispatch(setGameInfo(dataObject))

            // const res = await saveGameData(dataObject)
            // console.log(res)
            setCountry(null)
            setCity(null)
        } catch (err) {
            console.log(err)
        }
    }, [roomId, userInfo, country, city, socket])

    const [getGameData] = useGetGameDataMutation()
    const handleGetGameData = useCallback(async () => {
        try {
            const res = await getGameData(roomId?.roomId).unwrap()
            console.log(res)
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

    const onRestartGame = () => {
        socket.emit('restartGame', { roomId: roomId?.roomId })
    }

    const onGetResults = () => {
        // socket.emit('getResults', { roomId: roomId?.roomId })
        // fetch all game data
        socket.emit('gamePoints', roomId)
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

    const [gamePoints, setGamePoints] = useState(null)

    // on gamePointsServer
    useEffect(() => {
        const handleGamePointsServer = (data) => {
            setGamePoints(data)
        }

        socket.on('gamePointsServer', (data) => {
            handleGamePointsServer(data)
        })
        return () => socket.off('gamePointsServer', handleGamePointsServer)
    }, [socket])

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
            dispatch(clearGameInfo())
            setCharacter(null)
            setGamePoints(null)
            setGame(false)
        }

        socket.on('restartGameRoom', (roomRestart) => {
            handleRestartGame(roomRestart)
        })
        return () => socket.off('restartGameRoom', handleRestartGame)
    }, [socket, timer, setCharacter, setGame, dispatch])

    return (
        <>
            <div className="game-box-center">
                {/* display before each round */}
                {!game && roomInfo?.roundNumber < roomInfo?.roundQuantity && (
                    <button onClick={onStartGame}>
                        Start round{' '}
                        {roomInfo?.roundNumber < roomInfo?.roundQuantity
                            ? roomInfo?.roundNumber + 1
                            : ''}
                    </button>
                )}

                {/* display on end of the game */}
                {!game && roomInfo?.roundNumber >= roomInfo?.roundQuantity && (
                    <button onClick={onRestartGame}>ReStart</button>
                )}
                {!game && roomInfo?.roundNumber >= roomInfo?.roundQuantity && (
                    <button onClick={onGetResults}>Get results</button>
                )}
                {!game &&
                    roomInfo?.roundNumber >= roomInfo?.roundQuantity &&
                    gamePoints &&
                    gamePoints?.map((client, index) => (
                        <h1 key={index}>
                            {client.nickname}: {client.points}pkt
                        </h1>
                    ))}

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
                {/* {!game && gameInfo && roomInfo?.roundNumber > 0 && (
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
                )} */}

                {!game && roomInfo?.roundNumber > 0 && (
                    // round results
                    <ReviewAnswers></ReviewAnswers>
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
