// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route,
    Navigate,
} from 'react-router-dom'
import { store } from './redux/store'
import { Provider } from 'react-redux'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import RoomsCreatePage from './pages/RoomsCreatePage.jsx'
import RoomsIdPage from './pages/RoomsIdPage.jsx'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route
                path="/"
                element={<Navigate to="/home" replace={true} />}
            ></Route>

            <Route path="auth" element={<AuthPage />}></Route>
            <Route path="home" element={<HomePage />}></Route>
            <Route path="rooms/create" element={<RoomsCreatePage />}></Route>
            <Route path="rooms/:id" element={<RoomsIdPage />}></Route>
        </Route>
    )
)

ReactDOM.createRoot(document.getElementById('root')).render(
    // <React.StrictMode>
    //     <Provider store={store}>
    //         <RouterProvider router={router} />
    //     </Provider>
    // </React.StrictMode>

    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)
