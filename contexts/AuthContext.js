// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    signUp: async (email, password, username) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (data.user && !error) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              username: username,
              email: email,
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { data, error };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};