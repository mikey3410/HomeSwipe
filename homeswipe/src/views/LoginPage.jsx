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
    const [error, setError] =useState(''); 

    //used to ahnle credentials will pass the value
    function handleCreds(e) {
        setUserCreds({ ...userCreds, [e.target.name]: e.target.value });
        console.log(userCreds);
    }

    //User to handle signup
    function handleSignup(e) {
        e.preventDefault();

        //Async function will send to firebase
        createUserWithEmailAndPassword(auth, userCreds.email, userCreds.password)
            //If successful
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user);
                // ...
            })
            //Unsuccessful will display to user 
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(error.message); 
                console.log(errorCode);
                console.log(errorMessage);
                // ..
            });
    }

    return (
        <>
            {isLoading && <FullPageLoader></FullPageLoader>}

            <div className="container login-page">
                <section>
                    <h1>Welcome to the HomeSwipe</h1>
                    <p>Login or create an account to continue</p>
                    <div className="login-type">
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                loginType === 'login' ? 'bg-blue-600 text-white' : 'bg-transparent border border-black text-black'
                            }`}
                            onClick={() => setLoginType('login')}>
                            Login
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                loginType === 'signup' ? 'bg-green-600 text-white' : 'bg-transparent border border-black text-black'
                            }`}
                            onClick={() => setLoginType('signup')}>
                            Signup
                        </button>
                    </div>
                    <form className="add-form login">
                        <div className="form-control">
                            <label>Email *</label>
                            <input onChange={(e) => { handleCreds(e) }} type="text" name="email" placeholder="Enter your email" />
                        </div>
                        <div className="form-control">
                            <label>Password *</label>
                            <input onChange={(e) => { handleCreds(e) }} type="password" name="password" placeholder="Enter your password" />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-100 text-red-600 p-2 rounded-lg text-sm text-center border border-red-400">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        {loginType === 'login' ? (
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
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
                </section>
            </div>
        </>
    )
}

export default LoginPage
