import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './lib/supabase'; // Add this import
import { useEffect, useState } from 'react'; // Add this import

export default function App() {
  const [data, setData] = useState([]); // Add state for your data

  // Add your fetch function
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table_name') // Replace with your actual table name
      .select('*')
    
    if (error) {
      console.error('Error:', error)
    } else {
      setData(data)
      console.log('Data:', data) // You'll see this in the browser console
    }
  }

  // Fetch data when component loads
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>Supabase connected! Check console for data.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// Your existing styles stay the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});