import { Platform, StyleSheet } from 'react-native';

export default function WebMap() {
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  // For web platform, use an iframe directly
  return (
    <div style={styles.container}>
      <iframe 
        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11.html?title=true&access_token=pk.eyJ1IjoiYWFyb24tZmxldGNoZXI4NDIiLCJhIjoiY21mYTNibDFoMDlzeDJrcG81czM5MXlwaCJ9.qVEP338vG4rg9uX-ky1MVA#10/40.7128/-74.0060`}
        style={styles.iframe}
        title="Mapbox Map"
      />
    </div>
  );
}

// For React Native Web, we need to handle styles differently
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

// Add web-specific styles
if (Platform.OS === 'web') {
  styles.iframe = {
    width: '100%',
    height: '100%',
    border: 'none',
  };
}