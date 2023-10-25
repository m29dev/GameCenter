import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useOutletContext } from 'react-router-dom'
import './review.css'

const ReviewAnswers = () => {
    const { roomInfo } = useSelector((state) => state.auth)
    const [socket] = useOutletContext()
    const [hideReview, setHideReview] = useState(false)

    // round answers from server, all room's clients
    const [roundAnswers, setRoundAnswers] = useState([])
    useEffect(() => {
        const handleRoundAnswersServer = (data) => {
            setHideReview(false)
            console.log('handleRoundAnswersServer! ', data)
            setRoundAnswers((state) => [...state, data])
        }

        socket.on('roundAnswersServer', (data) => {
            handleRoundAnswersServer(data)
        })
        return () => socket.off('roundAnswersServer')
    }, [socket, setRoundAnswers])

    const handleReviewAnswer = (value, index_1, index_2) => {
        console.log(value, index_1, index_2)
        if (!value) roundAnswers?.[index_1]?.data?.[index_2].review.push(false)
        if (value) roundAnswers?.[index_1]?.data?.[index_2].review.pop()
    }

    const handleSaveReview = () => {
        let fixRoundAnswers = [...roundAnswers]
        fixRoundAnswers.map((roundAnswer) => {
            roundAnswer.data.map((userAnswer) => {
                if (userAnswer.answer === '') {
                    userAnswer.review.push(false)
                    console.log('found empty answer')
                }
            })
        })

        console.log(fixRoundAnswers)

        const dataObject = {
            roomId: roomInfo?.roomId,
            roundResults: fixRoundAnswers,
        }

        // send to da server saved review
        socket.emit('roundResults', dataObject)

        // hide review page
        setHideReview(true)
    }

    return (
        <>
            {!hideReview && (
                <div className="review-box">
                    <br />

                    <h2>Review answers - round {roomInfo?.roundNumber}</h2>

                    <hr />

                    {roundAnswers?.map((userObject, index_1) => (
                        <div key={index_1}>
                            <h1>{userObject?.nickname}</h1>

                            {userObject?.data?.map((item, index_2) => (
                                <div
                                    key={index_2}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <h4>
                                        {item?.category}: {item?.answer}
                                    </h4>

                                    <input
                                        type="checkbox"
                                        defaultChecked={
                                            item?.answer === '' ? false : true
                                        }
                                        onChange={(e) => {
                                            handleReviewAnswer(
                                                e.target.checked,
                                                index_1,
                                                index_2
                                            )
                                        }}
                                    />
                                </div>
                            ))}

                            <br />
                        </div>
                    ))}
                    <hr />
                    <Button variant="dark" onClick={handleSaveReview}>
                        Send review
                    </Button>
                </div>
            )}
        </>
    )
}

export default ReviewAnswers
