import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import AddGlyph from './AddGlyph';

export default function WebMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    console.log('Map effect running...');
    
    if (map.current) return; // initialize map only once
    
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    console.log('Creating map with token:', process.env.EXPO_PUBLIC_MAPBOX_TOKEN ? 'Token exists' : 'No token');
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.0060, 40.7128],
      zoom: 10
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
    });

    // Add click handler for placing glyphs
    map.current.on('click', (e) => {
      console.log('Map clicked!', e.lngLat);
      const { lng, lat } = e.lngLat;
      setSelectedCoords({ lng, lat });
      setShowAddGlyph(true);
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {showAddGlyph && (
        <AddGlyph 
          coordinates={selectedCoords}
          onClose={() => setShowAddGlyph(false)}
          onGlyphCreated={() => {
            setShowAddGlyph(false);
            // Optionally refresh map markers here
          }}
        />
      )}
    </div>
  );
}