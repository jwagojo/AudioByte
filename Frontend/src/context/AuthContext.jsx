import { createContext, useContext, useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const AuthContext = createContext(null);

// Configure Amplify with your Cognito settings
// These values will come from your CDK outputs after deployment
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      loginWith: {
        email: true,
        username: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
};

Amplify.configure(amplifyConfig);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (err) {
      console.error('Error getting auth token:', err);
      return null;
    }
  };

  const register = async (username, email, password, fullname) => {
    try {
      setError(null);
      const { userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name: fullname || '',
          },
        },
      });
      return { userId, nextStep };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const confirmRegistration = async (username, code) => {
    try {
      setError(null);
      await confirmSignUp({
        username,
        confirmationCode: code,
      });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const { isSignedIn, nextStep } = await signIn({
        username,
        password,
      });
      
      if (isSignedIn) {
        await checkUser();
      }
      
      return { isSignedIn, nextStep };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    confirmRegistration,
    login,
    logout,
    getAuthToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
