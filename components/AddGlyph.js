import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddGlyph({ coordinates, onClose, onGlyphCreated }) {
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
            user_id: null
          }
        ]);

      if (error) {
        console.error('Error creating glyph:', JSON.stringify(error, null, 2));
      } else {
        console.log('Glyph created successfully:', data);
        onGlyphCreated();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <h3>Add Glyph</h3>
      <p>Location: {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Hint">💡 Hint</option>
            <option value="Warning">⚠️ Warning</option>
            <option value="Secret">💰 Secret</option>
            <option value="Praise">❤️ Praise</option>
            <option value="Lore">👁️ Lore</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message for other explorers..."
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              minHeight: '80px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Glyph'}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}