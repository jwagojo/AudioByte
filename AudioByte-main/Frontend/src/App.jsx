// Frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <-- ADD Navigate
import Home from './pages/Home';
import Library from './pages/Library';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage'; // <-- ADD THIS
import Navbar from './components/Navbar';
import Player from './components/Player';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { AuthProvider, useAuth } from './context/AuthContext'; // <-- ADD AuthProvider & useAuth

// New component to protect routes
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    // Simple loading spinner or message while checking auth status
    return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading...</div>;
  }
  
  // Redirect to sign-in page if not logged in
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
};


function AppRoutes() { // Split routing logic into a separate component to use useAuth()
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} /> {/* <-- ADD AUTH ROUTE */}
      
      {/* PROTECTED ROUTES */}
      <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <MusicPlayerProvider>
      <Router>
        <AuthProvider> {/* <-- WRAP WITH AUTH PROVIDER */}
          <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="pb-24">
              <AppRoutes /> {/* <-- USE NEW ROUTING COMPONENT */}
            </main>
            <Player />
          </div>
        </AuthProvider>
      </Router>
    </MusicPlayerProvider>
  );
}

export default App;