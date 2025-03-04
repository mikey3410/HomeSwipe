import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and brand name with link to landing page */}
        <Link to="/" className="flex items-center gap-2 text-pink-500 hover:text-pink-600 transition-colors">
          <FaHome className="text-2xl" />
          <span className="font-bold text-xl">HomeSwipe</span>
        </Link>
        
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-gray-900">Products</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Learn</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Safety</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Support</a>
        </nav>
        
        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;