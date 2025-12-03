// Frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, signOut, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checks if a user is currently signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const authUser = await getCurrentUser();
        setUser(authUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (isSignedIn) {
        const authUser = await getCurrentUser();
        setUser(authUser);
        return authUser;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    // Note: Cognito username is set to email in CDK config
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      return { userId, isSignUpComplete, nextStep };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };
  
  const confirmSignup = async (email, code) => {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { isSignUpComplete, nextStep };
    } catch (error) {
      console.error('Confirmation error:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    logout,
    signUp: signup,
    confirmSignUp: confirmSignup,
    // Add other auth functions like resendConfirmationCode, forgotPassword, etc.
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};