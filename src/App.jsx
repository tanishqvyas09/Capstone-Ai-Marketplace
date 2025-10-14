import { Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage.jsx' // <-- Added .jsx extension
import DashboardPage from './DashboardPage.jsx' // <-- Added .jsx extension
import SEOrixPage from './SEOrixPage.jsx'
import WhatsPulsePage from './WhatsPulsePage.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/seorix" element={<SEOrixPage />} />
      <Route path="/whatspulse" element={<WhatsPulsePage />} />
    </Routes>
  )
}

export default App