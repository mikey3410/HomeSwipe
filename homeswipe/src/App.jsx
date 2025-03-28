//app.jsx
import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './views/Header.jsx'
import LoginPage from './views/LoginPage.jsx'
import LandingPage from './views/LandingPage.jsx'
import Home from './views/Home.jsx'
import SwipeFeature from './components/swipe/SwipeFeature.jsx';  // Import the swipe feature
import PreferencePage from './views/PreferencePage';
import LearnPage from './views/LearnPage.jsx';


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
          <Route path="/preferences" element={<PreferencePage />} />
          <Route path="/swipe" element={<SwipeFeature />} />
          <Route path="/learn" element={<LearnPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
