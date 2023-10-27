import { useCallback, useEffect, useState } from 'react'
import { useUserConnectMutation } from '../services/authService'
import { useDispatch, useSelector } from 'react-redux'
import { setUserInfo } from '../redux/authSlice'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'

const AuthPage = () => {
    const [nickname, setNickname] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userInfo } = useSelector((state) => state.auth)

    const [userConnect] = useUserConnectMutation()
    const onConnect = useCallback(
        async (e) => {
            try {
                e.preventDefault()
                if (nickname === (null || ''))
                    return window.alert('nickname value cannot be empty')
                const res = await userConnect(nickname).unwrap()
                dispatch(setUserInfo(res))
            } catch (err) {
                console.log(err)
            }
        },
        [userConnect, nickname, dispatch]
    )

    useEffect(() => {
        if (userInfo) navigate('/home')
    }, [userInfo, navigate])

    return (
        <>
            <div className="page-container">
                <h1>Państwa Miasta</h1>

                <form className="form-container" onSubmit={onConnect}>
                    <input
                        className="form-container-input"
                        type="text"
                        placeholder="Set a nickname"
                        onChange={(e) => {
                            setNickname(e?.target?.value)
                        }}
                        value={nickname}
                    />

                    <Button
                        variant="dark"
                        onClick={onConnect}
                        className="form-container-btn"
                    >
                        Connect
                    </Button>
                </form>
            </div>
        </>
    )
}

export default AuthPage
