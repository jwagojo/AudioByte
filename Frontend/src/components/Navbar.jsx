import { Link } from 'react-router-dom';
import { Home, Search, Upload, Library, User } from 'lucide-react';

function Navbar() {
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
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
