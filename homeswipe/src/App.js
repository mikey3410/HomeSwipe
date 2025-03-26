//app.js
import React from "react";
import "./App.css";
import LoginPage from "./views/LoginPage"; // Import your LoginPage component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>HomeSwipe</h1>
      </header>
      <LoginPage /> {/* Add this line to render the login page */}
    </div>
  );
}

export default App;