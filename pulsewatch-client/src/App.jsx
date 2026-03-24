import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import VerifyOTP from './pages/VerifyOTP'
import Dashboard from './pages/Dashboard'
import Logs      from './pages/Logs'

const isAuthenticated = () => !!localStorage.getItem('token')

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/logs/:id"   element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}