//app.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './views/Header.jsx'
import LoginPage from './views/LoginPage.jsx'
import HomePage from './views/LandingPage.jsx' // Assuming you have a HomePage component
import LandingPage from './views/LandingPage.jsx'
import Home from './views/Home.jsx'
import SwipeFeature from './features/swipe/SwipeFeature.jsx';  // Import the swipe feature

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Route for the landing page */}
          <Route path="/login" element={<LoginPage />} /> {/* Route for the login page */}
          <Route path='/home' element={<Home />} /> {/*Route for the Home pgae */}
          <Route path="/swipe" element={<SwipeFeature />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
