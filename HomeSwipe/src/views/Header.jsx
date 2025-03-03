import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left: Settings gear */}
        <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 
                 1.724 0 002.591 1.07c1.527-1.125 
                 3.37.718 2.244 2.244a1.724 1.724 0 001.07 
                 2.592c1.756.426 1.756 2.924 0 3.35a1.724 
                 1.724 0 00-1.07 2.591c1.125 1.527-.717 
                 3.37-2.244 2.244a1.724 1.724 0 00-2.591 
                 1.07c-.426 1.756-2.924 1.756-3.35 
                 0a1.724 1.724 0 00-2.592-1.07c-1.527 
                 1.125-3.37-.717-2.244-2.244a1.724 1.724 
                 0 00-1.07-2.591c-1.756-.426-1.756-2.924 
                 0-3.35a1.724 1.724 0 001.07-2.592c-1.125-1.527.717-3.37
                 2.244-2.244a1.724 1.724 0 002.591-1.07z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Center: "HomeSwipe" text */}
        <h1 className="text-xl font-bold text-black">HomeSwipe</h1>
        {/* Right: Chat button */}
        <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 01-2 2H7l-4 
                 4V5a2 2 0 012-2h14a2 2 0 
                 012 2v10z"
            />
          </svg>
        </button>
          <button className="px-4 py-2 rounded-lg font-semibold transition bg-blue-600 text-white"
            onClick={() => setLoginType('login')}>
              Login
        </button>
        </div>
    </nav>
  );
}
