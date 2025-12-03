// Frontend/src/pages/AuthPage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Mail, Lock, User, Send } from 'lucide-react';

function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login, signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignIn) {
        await login(email, password);
        navigate('/library'); // Redirect to library on success
      } else if (isConfirming) {
        await confirmSignUp(email, code);
        setIsConfirming(false);
        setIsSignIn(true);
        alert('Account successfully confirmed! You can now sign in.');
      } else {
        await signUp(email, password);
        setIsConfirming(true);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsSignIn(!isSignIn);
    setIsConfirming(false);
    setError(null);
    setEmail('');
    setPassword('');
    setCode('');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-orange-500">
          {isSignIn ? 'Sign In' : (isConfirming ? 'Confirm Sign Up' : 'Sign Up')}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-red-500/20 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Email"
              required
              disabled={loading || isConfirming}
            />
          </div>

          {!isConfirming && (
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>
          )}

          {isConfirming && (
            <div className="relative">
              <Send size={20} className="absolute left-3 top-3.5 text-gray-400" />
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Confirmation Code"
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !email || !password || (isConfirming && !code)}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignIn ? 'Sign In' : (isConfirming ? 'Confirm Code' : 'Sign Up'))}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={handleToggle} 
            className="text-orange-500 hover:text-orange-400 font-semibold transition"
            disabled={loading}
          >
            {isSignIn ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;