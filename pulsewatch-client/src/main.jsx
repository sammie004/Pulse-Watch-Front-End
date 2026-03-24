import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './styles/globals.css'
import App from './App.jsx'
// aos initialization
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
})
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
