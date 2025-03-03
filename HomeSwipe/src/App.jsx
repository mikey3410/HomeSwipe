import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./views/Header";
import LoginPage from "./views/LoginPage";
import SignupPage from "./views/SignupPage";
import Home from "./views/Home"; // Import Home page

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
