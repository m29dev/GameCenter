import { useCallback, useEffect, useState } from 'react'
// import { useGetGameDataMutation } from '../../services/roomService'
import { useDispatch, useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import { clearGameInfo, setGameInfo, setRoomInfo } from '../../redux/authSlice'
import ReviewAnswers from '../review/ReviewAnswers'
import Character from '../character/Character'
import './game.css'
import { Button } from 'react-bootstrap'

const Game = (data) => {
    const { userInfo, roomInfo, gameInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()
    const dispatch = useDispatch()

    // const [game, setGame] = useState(false)
    // const [character, setCharacter] = useState(null)

    // game config
    // categories
    const [country, setCountry] = useState(null)
    const [city, setCity] = useState(null)
    const [thing, setThing] = useState(null)
    const [celebrity, setCelebrity] = useState(null)

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
                        review: [],
                    },
                    {
                        category: 'Przedmiot',
                        answer: thing ? thing : '',
                        review: [],
                    },
                    {
                        category: 'Celebryta',
                        answer: celebrity ? celebrity : '',
                        review: [],
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
            setThing(null)
            setCelebrity(null)

            const updateGameInfoObject = {
                game: false,
                character: gameInfo?.character,
                reviewSent: gameInfo?.reviewSent,
                reviews: gameInfo?.reviews,
            }

            dispatch(setGameInfo(updateGameInfoObject))
        } catch (err) {
            console.log(err)
        }
    }, [
        data,
        userInfo,
        country,
        city,
        thing,
        celebrity,
        socket,
        dispatch,
        gameInfo,
    ])

    // const [getGameData] = useGetGameDataMutation()
    // const handleGetGameData = useCallback(async () => {
    //     try {
    //         const res = await getGameData(data?.roomId).unwrap()
    //         console.log(res)
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }, [getGameData, data])

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

    // const onGetResults = () => {
    //     // socket.emit('getResults', { roomId: roomId?.roomId })
    //     // fetch all game data
    //     socket.emit('gamePoints', data)
    // }

    // start the game
    useEffect(() => {
        const handleStartGame = (data) => {
            setCountry(null)
            setCity(null)
            console.log('game starts! ', data?.character)
            // setCharacter(data?.character)
            dispatch(setRoomInfo(data?.roomUpdate))
            // setGame(true)

            const gameInfoObject = {
                game: true,
                character: data?.character,
                reviewSent: false, //update to true after review sent
                reviews: [],
            }

            dispatch(setGameInfo(gameInfoObject))
        }

        socket.on('startGameRoom', (data) => {
            handleStartGame(data)
        })
        return () => socket.off('startGameRoom', handleStartGame)
    }, [socket, dispatch])

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

            // setGame(false)

            console.log('fetched data: ', res)
        }

        socket.on('endGameRoom', handleEndGame)
        return () => socket.off('endGameRoom', handleEndGame)
    }, [socket, handleSaveGameData])

    // re-start the game
    useEffect(() => {
        const handleRestartGame = (roomRestart) => {
            setCountry(null)
            setCity(null)
            setThing(null)
            setCelebrity(null)
            console.log('game has been restarted! ', roomRestart)
            dispatch(setRoomInfo(roomRestart))
            dispatch(clearGameInfo())
            // setCharacter(null)
            setGamePoints(null)
            // setGame(false)
        }

        socket.on('restartGameRoom', (roomRestart) => {
            handleRestartGame(roomRestart)
        })
        return () => socket.off('restartGameRoom', handleRestartGame)
    }, [socket, setThing, setCelebrity, dispatch])

    return (
        <>
            <div className="game-box-center">
                {/* game navbar */}
                <div className="game-navbar">
                    {/* leftside */}
                    <div>
                        {/* display before each round */}

                        {/* current round */}
                        {roomInfo?.roundNumber > 0 && !gamePoints && (
                            <div>
                                Round {roomInfo?.roundNumber}/
                                {roomInfo?.roundQuantity}
                            </div>
                        )}

                        {!gameInfo?.game &&
                            roomInfo?.roundNumber < roomInfo?.roundQuantity &&
                            roomInfo?.roundNumber === 0 && (
                                <Button
                                    variant="dark"
                                    onClick={onStartGame}
                                    style={{ paddingLeft: '0px' }}
                                >
                                    Start Game
                                </Button>
                            )}

                        {!gameInfo?.game &&
                            gamePoints &&
                            roomInfo?.roundNumber >=
                                roomInfo?.roundQuantity && (
                                <>
                                    <Button
                                        variant="dark"
                                        onClick={onRestartGame}
                                        style={{ paddingLeft: '0px' }}
                                    >
                                        Restart Game
                                    </Button>
                                    {/* <Button variant="dark" onClick={onGetResults}>
                                    Get results
                                </Button> */}
                                </>
                            )}
                    </div>
                </div>

                {/* display before start of the game */}
                {!gameInfo?.game &&
                    roomInfo?.roundNumber < roomInfo?.roundQuantity &&
                    roomInfo?.roundNumber === 0 && (
                        <div className="game-container">
                            <div
                                style={{
                                    marginTop: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <h4
                                    style={{
                                        margin: '0px',
                                        marginRight: '12px',
                                    }}
                                >
                                    Invite friends
                                </h4>
                                <Button
                                    variant="dark"
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            window.location.href
                                        )
                                    }
                                >
                                    Copy link
                                </Button>
                            </div>
                        </div>
                    )}

                {/* display game round */}
                {gameInfo?.game && (
                    <>
                        <div className="game-container">
                            <Character
                                character={gameInfo?.character}
                                theme="purple"
                            ></Character>

                            {/* game box */}
                            <div className="game-box">
                                {/* panstwo */}
                                <label htmlFor="Panstwo">Panstwo</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${gameInfo?.character}...`}
                                    onChange={(e) => {
                                        setCountry(e.target.value)
                                    }}
                                />

                                {/* miasto */}
                                <label htmlFor="Miasto">Miasto</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${gameInfo?.character}...`}
                                    onChange={(e) => {
                                        setCity(e.target.value)
                                    }}
                                />

                                {/* przedmiot */}
                                <label htmlFor="Przedmiot">Przedmiot</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${gameInfo?.character}...`}
                                    onChange={(e) => {
                                        setThing(e.target.value)
                                    }}
                                />

                                {/* celebryta */}
                                <label htmlFor="Przedmiot">Celebryta</label>
                                <input
                                    className="game-text-input-box"
                                    type="text"
                                    placeholder={`${gameInfo?.character}...`}
                                    onChange={(e) => {
                                        setCelebrity(e.target.value)
                                    }}
                                />

                                <Button
                                    variant="dark"
                                    style={{
                                        margin: 'auto',
                                        marginTop: '18px',
                                    }}
                                    onClick={onEndGame}
                                >
                                    End Round
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* display on end of the game / round */}
                {!gameInfo?.game && (
                    <div className="stats-box">
                        {/* display at the end of the game */}
                        {roomInfo?.roundNumber >= roomInfo?.roundQuantity && (
                            <div style={{ marginTop: '30px' }}>
                                {/* display if game results has been fetched */}
                                {gamePoints &&
                                    gamePoints?.map((client, index) => (
                                        <h1 key={index}>
                                            {client.nickname}: {client.points}
                                            pkt
                                        </h1>
                                    ))}
                            </div>
                        )}

                        {/* display game review answers after each round */}
                        {roomInfo?.roundNumber > 0 && !gamePoints && (
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
