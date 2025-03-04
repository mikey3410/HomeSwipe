import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background image grid */}
      <div className="absolute inset-0 bg-black/30 z-10">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1 opacity-80">
          {/* This would be replaced with actual images in a production app */}
          {Array(15).fill().map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-cover bg-center" 
                 style={{backgroundImage: `url(https://source.unsplash.com/random/300x400?portrait&sig=${i})`}}>
            </div>
          ))}
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-center">Swipe Home®</h1>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link to="/login" className="bg--500 hover:bg-black-600 text-white py-3 px-6 rounded-full font-medium text-center transition-colors">
            Create account
          </Link>
          
          <Link to="/login" className="bg-white hover:bg-gray-100 text-black py-3 px-6 rounded-full font-medium text-center transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;