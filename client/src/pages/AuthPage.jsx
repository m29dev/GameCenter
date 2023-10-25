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
                console.log(res)
                dispatch(setUserInfo(res))
            } catch (err) {
                console.log(err)
            }
        },
        [userConnect, nickname, dispatch]
    )

    useEffect(() => {
        console.log('userInfo update')
        if (userInfo) navigate('/home')
    }, [userInfo, navigate])

    return (
        <>
            <h1>Państwa Miasta</h1>

            <form className="form-container" onSubmit={onConnect}>
                <input
                    className="form-container-input"
                    type="text"
                    placeholder="Set nickname"
                    onChange={(e) => {
                        setNickname(e?.target?.value)
                    }}
                    value={nickname}
                />
                <Button variant="dark" className="form-container-btn">
                    Connect
                </Button>
            </form>
        </>
    )
}

export default AuthPage
