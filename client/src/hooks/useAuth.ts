import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { logEvent } from 'firebase/analytics';
import { auth, analytics } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Log login attempt event
      logEvent(analytics, 'login', {
        method: 'google'
      });
      
      await signInWithPopup(auth, provider);
      
      // Log successful login event
      logEvent(analytics, 'login_success', {
        method: 'google'
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Log failed login event
      logEvent(analytics, 'login_failed', {
        method: 'google',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log logout event
      logEvent(analytics, 'logout');
      
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout
  };
};
