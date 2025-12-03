// Frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { Auth } from 'aws-amplify'; // Import Amplify Auth module

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
        const authUser = await Auth.currentAuthenticatedUser();
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
      const authUser = await Auth.signIn(username, password);
      setUser(authUser);
      return authUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    // Note: Cognito username is set to email in CDK config
    try {
      const { user: cognitoUser } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
        },
      });
      return cognitoUser;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };
  
  const confirmSignUp = async (email, code) => {
    try {
      await Auth.confirmSignUp(email, code);
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
    signUp,
    confirmSignUp,
    // Add other auth functions like resendConfirmationCode, forgotPassword, etc.
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};