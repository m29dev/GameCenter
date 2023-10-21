import { useCallback, useEffect, useState } from 'react'
import { useUserConnectMutation } from '../services/authService'
import { useDispatch, useSelector } from 'react-redux'
import { setUserInfo } from '../redux/authSlice'
import { useNavigate } from 'react-router-dom'

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
            <h5>set Your nickname: </h5>
            <form onSubmit={onConnect}>
                <input
                    type="text"
                    onChange={(e) => {
                        setNickname(e?.target?.value)
                    }}
                    value={nickname}
                />
                <button disabled={nickname ? false : true}>Connect</button>
            </form>
        </>
    )
}

export default AuthPage
