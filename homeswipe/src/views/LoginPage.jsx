import { createUserWithEmailAndPassword } from "firebase/auth";
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
                    <h1>Welcome to the Book App</h1>
                    <p>Login or create an account to continue</p>
                    <div className="login-type">
                        <button
                            className={`btn ${loginType == 'login' ? 'selected' : ''}`}
                            onClick={() => setLoginType('login')}>
                            Login
                        </button>
                        <button
                            className={`btn ${loginType == 'signup' ? 'selected' : ''}`}
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
                        {
                            loginType == 'login' ?
                                <button className="active btn btn-block">Login</button>
                                :
                                <button onClick={(e) => { handleSignup(e) }} className="active btn btn-block">Sign Up</button>
                        }

                        {
                            error && 
                            <div className="error">
                            {error}
                        </div>
                        }
                       

                        <p className="forgot-password">Forgot Password?</p>

                    </form>
                </section>
            </div>
        </>
    )
}

export default LoginPage
