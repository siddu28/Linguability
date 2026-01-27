import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Lessons from './pages/Lessons'
import Practice from './pages/Practice'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/practice" element={<Practice />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
