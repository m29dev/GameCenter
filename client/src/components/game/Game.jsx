import { useCallback, useEffect, useState } from 'react'
import { useGetGameDataMutation } from '../../services/roomService'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import { clearGameInfo, setRoomInfo } from '../../redux/authSlice'
import ReviewAnswers from '../review/ReviewAnswers'
import Character from '../character/Character'
import './game.css'
import { Button } from 'react-bootstrap'

const Game = (data) => {
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
                roomId: data?.roomId,
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
    }, [data, userInfo, country, city, socket])

    const [getGameData] = useGetGameDataMutation()
    const handleGetGameData = useCallback(async () => {
        try {
            const res = await getGameData(data?.roomId).unwrap()
            console.log(res)
        } catch (err) {
            console.log(err)
        }
    }, [getGameData, data])

    // const [counter, setCounter] = useState(10)
    // const timer = useCallback(() => {
    //     let num = 9
    //     const intervalRef = setInterval(() => {
    //         if (num >= 0) {
    //             setCounter(num)
    //             console.log(num)
    //             num--
    //         } else {
    //             clearInterval(intervalRef)
    //         }
    //     }, 1000)
    // }, [setCounter])

    const [game, setGame] = useState(false)
    const [character, setCharacter] = useState(null)

    // on start the game emit startGame to all room's clients
    const onStartGame = () => {
        socket.emit('startGame', { roomId: data?.roomId })
    }

    // on end the game
    const onEndGame = () => {
        socket.emit('endGame', { roomId: data?.roomId })
    }

    const onRestartGame = () => {
        socket.emit('restartGame', { roomId: data?.roomId })
    }

    const onGetResults = () => {
        // socket.emit('getResults', { roomId: roomId?.roomId })
        // fetch all game data
        socket.emit('gamePoints', data)
    }

    // start the game
    useEffect(() => {
        const handleStartGame = (data) => {
            setCountry(null)
            setCity(null)
            console.log('game starts! ', data?.character)
            setCharacter(data?.character)
            dispatch(setRoomInfo(data?.roomUpdate))
            setGame(true)
        }

        socket.on('startGameRoom', (data) => {
            handleStartGame(data)
        })
        return () => socket.off('startGameRoom', handleStartGame)
    }, [socket, setCharacter, setGame, dispatch])

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
    }, [socket, setCharacter, setGame, dispatch])

    return (
        <>
            <div className="game-box-center">
                {/* game navbar */}
                <div className="game-navbar">
                    {/* leftside */}
                    <div>
                        {/* display before each round */}

                        {/* current round */}
                        {roomInfo?.roundNumber > 0 && (
                            <div>
                                Round {roomInfo?.roundNumber}/
                                {roomInfo?.roundQuantity}
                            </div>
                        )}

                        {!game &&
                            roomInfo?.roundNumber < roomInfo?.roundQuantity &&
                            roomInfo?.roundNumber === 0 && (
                                <Button variant="dark" onClick={onStartGame}>
                                    Start Game
                                </Button>
                            )}

                        {roomInfo?.roundNumber >= roomInfo?.roundQuantity && (
                            <>
                                <Button variant="dark" onClick={onRestartGame}>
                                    Restart game
                                </Button>
                                {/* <Button variant="dark" onClick={onGetResults}>
                                    Get results
                                </Button> */}
                            </>
                        )}
                    </div>
                </div>

                {/* display game round */}
                {game && (
                    <>
                        <div className="game-container">
                            <Character
                                character={character}
                                theme="purple"
                            ></Character>

                            {/* game box */}
                            <div className="game-box">
                                <label htmlFor="Panstwo">Panstwo</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${character}...`}
                                    onChange={(e) => {
                                        setCountry(e.target.value)
                                    }}
                                />
                                <label htmlFor="Miasto">Miasto</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${character}...`}
                                    onChange={(e) => {
                                        setCity(e.target.value)
                                    }}
                                />

                                <Button
                                    variant="dark"
                                    style={{ margin: 'auto' }}
                                    onClick={onEndGame}
                                >
                                    End Round
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* display on end of the game / round */}
                {!game && (
                    <div className="stats-box">
                        {/* display at the end of the game */}
                        {roomInfo?.roundNumber >= roomInfo?.roundQuantity && (
                            <>
                                {/* display if game results has been fetched */}
                                {gamePoints &&
                                    gamePoints?.map((client, index) => (
                                        <h1 key={index}>
                                            {client.nickname}: {client.points}
                                            pkt
                                        </h1>
                                    ))}
                            </>
                        )}

                        {/* display game review answers after each round */}
                        {roomInfo?.roundNumber > 0 && (
                            // round answers
                            <ReviewAnswers></ReviewAnswers>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default Game
