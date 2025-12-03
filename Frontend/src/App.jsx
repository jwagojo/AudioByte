import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Player from './components/Player';
import ProtectedRoute from './components/ProtectedRoute';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <MusicPlayerProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <main className="pb-24">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </main>
                    <Player />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </MusicPlayerProvider>
    </AuthProvider>
  );
}

export default App;