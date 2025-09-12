// App.js
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import WebMap from './components/WebMap';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PasswordResetPage from './components/PasswordResetPage';

// Main app component that uses auth context
function MainApp() {
  const { user, userProfile, loading } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    // Check if URL contains reset-password
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    if (currentPath.includes('reset-password')) {
      setIsResetPassword(true);
    }
  }, []);

  if (isResetPassword) {
    return <PasswordResetPage />;
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
          Loading Glyph...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <WebMap />
        <Auth onAuthSuccess={(user) => console.log('Auth success:', user)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebMap user={user} userProfile={userProfile} />
      <UserProfile 
        user={userProfile || user} 
        onSignOut={() => console.log('Signed out')} 
      />
      <StatusBar style="auto" />
    </View>
  );
}

// Root app component with auth provider
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});