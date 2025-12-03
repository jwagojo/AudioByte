import { Link, useNavigate } from 'react-router-dom';
import { Home, Globe, Upload, Library, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-ghrathe text-2xl font-bold text-orange-500">
            AudioByte
          </Link>
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 hover:text-orange-500 transition">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="flex items-center gap-2 hover:text-orange-500 transition">
              <Globe size={20} />
              <span>Explore</span>
            </Link>
            <Link to="/library" className="flex items-center gap-2 hover:text-orange-500 transition">
              <Library size={20} />
              <span>Library</span>
            </Link>
            <Link to="/upload" className="flex items-center gap-2 hover:text-orange-500 transition">
              <Upload size={20} />
              <span>Upload</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 hover:text-orange-500 transition">
              <User size={20} />
              <span>Profile</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 hover:text-orange-500 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
