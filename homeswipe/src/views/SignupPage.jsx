import { createUserWithEmailAndPassword } from "firebase/auth";
import FullPageLoader from "../components/FullpageLoader.jsx";
import React, { useState } from "react";
import { auth } from "../firebase/config.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function SignupPage() {
  const [isLoading, setLoading] = useState(false);
  const [userCreds, setUserCreds] = useState({});
  const [error, setError] = useState("");

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

  function handleGoogleSignup() {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }

  return (
    <>
      {isLoading && <FullPageLoader />}

      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="bg-white border border-gray-300 shadow-md rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-black text-center">
            Create an Account
          </h1>
          <p className="text-gray-700 text-center mb-6">
            Sign up to access HomeSwipe
          </p>

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

            {/* Sign Up Button */}
            <button
              onClick={handleSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
            >
              Sign Up
            </button>
          </form>

          {/* Separator */}
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Sign Up Button */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="flex items-center justify-center w-12 h-12 bg-white border border-gray-300 rounded-lg shadow hover:shadow-md transition"
              aria-label="Sign up with Google"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google logo" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupPage;