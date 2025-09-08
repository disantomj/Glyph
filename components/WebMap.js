import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import AddGlyph from './AddGlyph';
import { supabase } from '../lib/supabase';

export default function WebMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [showAddGlyph, setShowAddGlyph] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [glyphs, setGlyphs] = useState([]);
  const markersRef = useRef([]); // Keep track of markers for cleanup

  // Category icons mapping
  const categoryIcons = {
    'Hint': '💡',
    'Warning': '⚠️',
    'Secret': '💰',
    'Praise': '❤️',
    'Lore': '👁️'
  };

  // Load glyphs from database
  const loadGlyphs = async () => {
  try {
    const { data, error } = await supabase
      .from('glyphs')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error loading glyphs:', error);
    } else {
      console.log('Loaded glyphs from database:', data); // Add this line
      console.log('Number of glyphs loaded:', data?.length); // And this line
      setGlyphs(data || []);
    }
  } catch (err) {
    console.error('Unexpected error loading glyphs:', err);
  }
};

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Add markers to map
  const addMarkersToMap = () => {
    if (!map.current) return;

    console.log('Adding markers for glyphs:', glyphs); // Add this line
    console.log('Number of glyphs to display:', glyphs.length); // And this line

    clearMarkers();

    glyphs.forEach(glyph => {
      // Create a custom marker element
      const markerElement = document.createElement('div');
      markerElement.innerHTML = categoryIcons[glyph.category] || '📍';
      markerElement.style.fontSize = '24px';
      markerElement.style.cursor = 'pointer';
      markerElement.title = `${glyph.category}: ${glyph.text?.substring(0, 50)}...`;

      // Create and add marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([glyph.longitude, glyph.latitude])
        .addTo(map.current);

      // Add click handler to marker
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent map click
        
        // Create popup with glyph info
        new mapboxgl.Popup()
          .setLngLat([glyph.longitude, glyph.latitude])
          .setHTML(`
            <div style="padding: 10px;">
              <h4>${categoryIcons[glyph.category]} ${glyph.category}</h4>
              <p>${glyph.text}</p>
              <small>Created: ${new Date(glyph.created_at).toLocaleDateString()}</small>
            </div>
          `)
          .addTo(map.current);
      });

      markersRef.current.push(marker);
    });
  };

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
      loadGlyphs(); // Load glyphs when map is ready
    });

    // Add click handler for placing glyphs
    map.current.on('click', (e) => {
      console.log('Map clicked!', e.lngLat);
      const { lng, lat } = e.lngLat;
      setSelectedCoords({ lng, lat });
      setShowAddGlyph(true);
    });
  }, []);

  // Add markers when glyphs change
  useEffect(() => {
    if (map.current && glyphs.length > 0) {
      addMarkersToMap();
    }
  }, [glyphs]);

  const handleGlyphCreated = () => {
    setShowAddGlyph(false);
    loadGlyphs(); // Reload glyphs to show the new one
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {showAddGlyph && (
        <AddGlyph 
          coordinates={selectedCoords}
          onClose={() => setShowAddGlyph(false)}
          onGlyphCreated={handleGlyphCreated}
        />
      )}
    </div>
  );
}