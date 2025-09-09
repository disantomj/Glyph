// components/AddGlyph.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddGlyph({ coordinates, onClose, onGlyphCreated, user }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Hint');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('glyphs')
        .insert([
          {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            text: message,
            category: category,
            user_id: user?.id || null, // Now using the actual user ID
            is_active: true,
            score: 0
          }
        ])
        .select(); // Add select to get the created glyph back

      if (error) {
        console.error('Error creating glyph:', JSON.stringify(error, null, 2));
        alert('Error creating glyph. Please try again.');
      } else {
        console.log('Glyph created successfully:', data);
        onGlyphCreated(data[0]); // Pass the created glyph back
        alert('Glyph created! Other explorers can now discover it.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      minWidth: '350px',
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#333' }}>
        🔮 Create New Glyph
      </h3>
      <p style={{ 
        margin: '0 0 20px 0', 
        fontSize: '14px', 
        color: '#666',
        backgroundColor: '#f8f9fa',
        padding: '8px 12px',
        borderRadius: '6px'
      }}>
        📍 {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Glyph Type:
          </label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="Hint">💡 Hint - Helpful tip</option>
            <option value="Warning">⚠️ Warning - Important alert</option>
            <option value="Secret">💰 Secret - Hidden gem</option>
            <option value="Praise">❤️ Praise - Love this place</option>
            <option value="Lore">👁️ Lore - History & stories</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Message:
          </label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your discovery with fellow explorers..."
            required
            maxLength={280}
            style={{ 
              width: '100%', 
              padding: '12px', 
              minHeight: '100px',
              resize: 'vertical',
              boxSizing: 'border-box',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'right', 
            marginTop: '5px' 
          }}>
            {message.length}/280 characters
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="submit" 
            disabled={isSubmitting || !message.trim()}
            style={{
              flex: 1,
              padding: '14px 20px',
              backgroundColor: isSubmitting || !message.trim() ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting || !message.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {isSubmitting ? 'Creating...' : '🔮 Create Glyph'}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}