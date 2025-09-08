import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddGlyph({ coordinates, onClose, onGlyphCreated }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('hint');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('glyphs')
      .insert([
        {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          message: message,
          category: category,
          user_id: 'anonymous' // Replace with actual user later
        }
      ]);

    if (error) {
      console.error('Error creating glyph:', error);
    } else {
      console.log('Glyph created:', data);
      onGlyphCreated();
    }
    
    setIsSubmitting(false);
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
      zIndex: 1000
    }}>
      <h3>Add Glyph</h3>
      <p>Location: {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="hint">💡 Hint</option>
            <option value="warning">⚠️ Warning</option>
            <option value="secret">💰 Secret</option>
            <option value="praise">❤️ Praise</option>
            <option value="lore">👁️ Lore</option>
          </select>
        </div>
        
        <div>
          <label>Message:</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message for other explorers..."
            required
          />
        </div>
        
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Glyph'}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}