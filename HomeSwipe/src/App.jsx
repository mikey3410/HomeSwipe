import { useState } from 'react'
import './App.css'
import Header from './views/Header'
import LoginPage from './views/LoginPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
    <header className="App-header">
      <Header />
    </header>
    <LoginPage /> {/* Add this line to render the login page */}
  </div>
  )
}

export default App
