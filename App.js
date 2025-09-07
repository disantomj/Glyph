import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase';
import { useEffect, useState } from 'react';
import WebMap from './components/WebMap';

export default function App() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table_name')
      .select('*')
    
    if (error) {
      console.error('Error:', error)
    } else {
      setData(data)
      console.log('Data:', data)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <View style={styles.container}>
      {/* Add the WebMap component */}
      <WebMap />

      {/* Your content overlay */}
      <View style={styles.overlay}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Supabase connected! Check console for data.</Text>
        <StatusBar style="auto" />
      </View>
    </View> // This closes the outer View
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
  },
});