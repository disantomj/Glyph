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
    let isMounted = true;

    // Single initialization function that handles both initial session and auth changes
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        // Only update state if component is still mounted
        if (isMounted) {
          if (session?.user) {
            console.log('Initial session found:', session.user.email);
            setUser(session.user);
            // Fetch profile in the background, don't block auth state
            fetchUserProfile(session.user.id).catch(err => 
              console.error('Profile fetch failed:', err)
            );
          } else {
            console.log('No initial session found');
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error in auth initialization:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          // Fetch profile in the background
          fetchUserProfile(session.user.id).catch(err => 
            console.error('Profile fetch failed during auth change:', err)
          );
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        // Always set loading to false after auth state change
        setLoading(false);
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Separate async function for profile fetching that doesn't block auth state
  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating one');
        
        // Get current user to create profile
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const username = currentUser.email?.split('@')[0] || 'Explorer';
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: currentUser.id,
              username: username,
              email: currentUser.email,
            })
            .select()
            .single();

          if (createError && createError.code !== '23505') {
            console.error('Error creating profile:', createError);
          } else if (newProfile) {
            console.log('User profile created:', newProfile);
            setUserProfile(newProfile);
          }
        }
      } else if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        console.log('User profile fetched:', data);
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
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
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