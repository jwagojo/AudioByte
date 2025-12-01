import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Player from './components/Player';
import { MusicPlayerProvider } from './context/MusicPlayerContext';

function App() {
  return (
    <MusicPlayerProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <main className="pb-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Player />
        </div>
      </Router>
    </MusicPlayerProvider>
  );
}

export default App;