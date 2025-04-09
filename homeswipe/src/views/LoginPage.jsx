// src/views/LoginPage.jsx
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
  } from "firebase/auth";
  import FullPageLoader from '../components/FullpageLoader.jsx';
  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { auth } from "../firebase/config.js";
  
  function LoginPage() {
    const [isLoading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('login');
    const [userCreds, setUserCreds] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    function handleCreds(e) {
      setUserCreds({ ...userCreds, [e.target.name]: e.target.value });
    }
  
    function handleSignup(e) {
      e.preventDefault();
      setLoading(true);
      createUserWithEmailAndPassword(auth, userCreds.email, userCreds.password)
        .then((userCredential) => {
          console.log(userCredential.user);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setLoading(false);
        });
    }
  
    function handleLogin(e) {
      e.preventDefault();
      signInWithEmailAndPassword(auth, userCreds.email, userCreds.password)
        .then((userCredential) => {
          console.log(userCredential.user);
          navigate('/preferences');
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  
    return (
      <>
        {isLoading && <FullPageLoader />}
  
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200">
          <div className="bg-white border border-gray-300 shadow-lg rounded-3xl p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome to HomeSwipe</h1>
            <p className="text-gray-600 text-center mb-6">Login or create an account to continue</p>
  
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition ${loginType === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent border border-black text-black'}`}
                onClick={() => setLoginType('login')}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition ${loginType === 'signup'
                  ? 'bg-green-600 text-white'
                  : 'bg-transparent border border-black text-black'}`}
                onClick={() => setLoginType('signup')}
              >
                Sign Up
              </button>
            </div>
  
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  onChange={handleCreds}
                  type="email"
                  name="email"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                  placeholder="Enter your email"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  onChange={handleCreds}
                  type="password"
                  name="password"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"
                  placeholder="Enter your password"
                />
              </div>
  
              {error && (
                <div className="bg-red-100 text-red-600 p-2 rounded-lg text-sm text-center border border-red-400">
                  {error}
                </div>
              )}
  
              {loginType === 'login' ? (
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-3 rounded-lg shadow-md transition"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={handleSignup}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg shadow-md transition"
                >
                  Sign Up
                </button>
              )}
  
        
            </form>
          </div>
        </div>
      </>
    );
  }
  
  export default LoginPage;