import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlyphService } from '../services/GlyphService';
import { StorageService } from '../services/StorageService';
import { 
  GLYPH_CATEGORIES, 
  CATEGORY_OPTIONS 
} from '../constants/categories';
import { 
  FILE_LIMITS, 
  TEXT_LIMITS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../constants/config';
import { 
  BUTTON_STYLES, 
  INPUT_STYLES, 
  MODAL_STYLES,
  MESSAGE_STYLES,
  mergeStyles 
} from '../constants/styles';

export default function AddGlyph({ coordinates, onClose, onGlyphCreated, user }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(GLYPH_CATEGORIES.HINT);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
        alert(ERROR_MESSAGES.INVALID_FILE_TYPE);
        return;
      }
      
      // Validate file size
      if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
        alert(ERROR_MESSAGES.FILE_TOO_LARGE);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let photoUrl = null;

      // Create the glyph first
      const glyphData = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        text: message,
        category: category,
        user_id: user?.id || null,
        is_active: true,
        score: 0
      };

      const { data, error } = await supabase
        .from('glyphs')
        .insert([glyphData])
        .select();

      if (error) {
        console.error('Error creating glyph:', JSON.stringify(error, null, 2));
        alert('Error creating glyph. Please try again.');
        return;
      }

      const createdGlyph = data[0];

      // Upload photo if selected
      if (selectedFile) {
        try {
          photoUrl = await StorageService.uploadGlyphPhoto(selectedFile, createdGlyph.id);
          
          // Update glyph with photo URL
          const { error: updateError } = await supabase
            .from('glyphs')
            .update({ photo_url: photoUrl })
            .eq('id', createdGlyph.id);

          if (updateError) {
            console.error('Error updating glyph with photo:', updateError);
            // Don't fail the whole operation, just log the error
          } else {
            createdGlyph.photo_url = photoUrl;
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError);
          alert('Glyph created but photo upload failed. You can add a photo later.');
        }
      }

      console.log('Glyph created successfully:', createdGlyph);
      onGlyphCreated(createdGlyph);
      alert(SUCCESS_MESSAGES.GLYPH_CREATED);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={mergeStyles(MODAL_STYLES.overlay)}>
      <div style={mergeStyles(MODAL_STYLES.small, {
        minWidth: '400px',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      })}>
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
          {/* Category Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Glyph Type:
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={mergeStyles(INPUT_STYLES.base)}
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Photo (optional):
            </label>
            
            {!selectedFile ? (
              <div style={{
                border: '2px dashed #e1e5e9',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onClick={() => document.getElementById('photo-input').click()}
              onMouseEnter={(e) => e.target.style.borderColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e1e5e9'}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                  Click to add a photo
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  JPG, PNG up to {FILE_LIMITS.MAX_SIZE_MB}MB
                </p>
                <input
                  id="photo-input"
                  type="file"
                  accept={FILE_LIMITS.ALLOWED_TYPES.join(',')}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9'
                  }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Message:
            </label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your discovery with fellow explorers..."
              required
              maxLength={TEXT_LIMITS.GLYPH_MESSAGE_MAX}
              style={mergeStyles(INPUT_STYLES.base, INPUT_STYLES.textarea)}
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              textAlign: 'right', 
              marginTop: '5px' 
            }}>
              {message.length}/{TEXT_LIMITS.GLYPH_MESSAGE_MAX} characters
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              style={mergeStyles(
                BUTTON_STYLES.base,
                isSubmitting || !message.trim() ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary,
                { flex: 1, padding: '14px 20px', fontSize: '16px', fontWeight: '600' }
              )}
            >
              {isSubmitting ? 'Creating...' : '🔮 Create Glyph'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={mergeStyles(
                BUTTON_STYLES.base,
                BUTTON_STYLES.secondary,
                { flex: 1, padding: '14px 20px', fontSize: '16px' }
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}