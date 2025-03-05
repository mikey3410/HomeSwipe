import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and brand name with link to landing page */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <FaHome className="text-3xl text-gray-800 group-hover:text-gray-900 transition-colors z-10 relative" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-400 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300 drop-shadow-sm">
            Home<span className="text-blue-400 group-hover:text-blue-400">Swipe</span>
          </span>
        </Link>
        
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900">Homes</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Learn</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Safety</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Help</a>
        </nav>
        
        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="group relative inline-flex items-center justify-center">
            <span className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-400 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300"></span>
            <span className="relative bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-6 border border-gray-300 rounded-full shadow-sm transition-all duration-300 group-hover:shadow-md">
              Log in
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;