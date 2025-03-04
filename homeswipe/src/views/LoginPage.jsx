import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import FullPageLoader from '../components/FullpageLoader.jsx';
import React, { useState } from 'react';
import { auth } from "../firebase/config.js"

function LoginPage() {
    const [isLoading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('login');
    const [userCreds, setUserCreds] = useState({});
    const [error, setError] = useState('');

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
                // Signed in 
                const user = userCredential.user;
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
            });
    }

    return (
        <>
            {isLoading && <FullPageLoader />}

            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="bg-white border border-gray-300 shadow-md rounded-lg p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold text-black text-center">Welcome to HomeSwipe</h1>
                    <p className="text-gray-700 text-center mb-6">Login or create an account to continue</p>

                    {/* Login/Signup Toggle */}
                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold transition ${loginType === 'login' ? 'bg-blue-600 text-white' : 'bg-transparent border border-black text-black'
                                }`}
                            onClick={() => setLoginType('login')}>
                            Login
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold transition ${loginType === 'signup' ? 'bg-green-600 text-white' : 'bg-transparent border border-black text-black'
                                }`}
                            onClick={() => setLoginType('signup')}>
                            Signup
                        </button>
                    </div>
                    {/* Form Inputs */}
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-black">Email *</label>
                            <input
                                onChange={handleCreds}
                                type="email"
                                name="email"
                                className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-transparent text-black"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black">Password *</label>
                            <input
                                onChange={handleCreds}
                                type="password"
                                name="password"
                                className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-transparent text-black"
                                placeholder="Enter your password"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 text-red-600 p-2 rounded-lg text-sm text-center border border-red-400">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {loginType === 'login' ? (
                            <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
                                Login
                            </button>
                        ) : (
                            <button onClick={handleSignup} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">
                                Sign Up
                            </button>
                        )}

                        <p className="text-sm text-black text-center mt-4 cursor-pointer hover:underline">
                            Forgot Password?
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

export default LoginPage;
