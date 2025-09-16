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
  COLORS,
  BUTTON_STYLES, 
  INPUT_STYLES, 
  MODAL_STYLES,
  MESSAGE_STYLES,
  TEXT_STYLES,
  CARD_STYLES,
  DESIGN_TOKENS,
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
    <div style={MODAL_STYLES.overlay}>
      <div style={mergeStyles(MODAL_STYLES.small, {
        minWidth: '400px',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      })}>
        <h3 style={mergeStyles(TEXT_STYLES.h3, { 
          margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`,
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing[2]
        })}>
          🔮 Create New Glyph
        </h3>
        
        <div style={mergeStyles(CARD_STYLES.base, {
          padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
          marginBottom: DESIGN_TOKENS.spacing[5],
          backgroundColor: COLORS.bgSecondary,
          fontSize: TEXT_STYLES.caption.fontSize,
          color: COLORS.textSecondary
        })}>
          📍 {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
            <label style={TEXT_STYLES.label}>
              Glyph Type:
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={mergeStyles(INPUT_STYLES.base, INPUT_STYLES.select)}
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
            <label style={TEXT_STYLES.label}>
              Photo (optional):
            </label>
            
            {!selectedFile ? (
              <div 
                style={mergeStyles(CARD_STYLES.base, {
                  border: `2px dashed ${COLORS.borderMedium}`,
                  padding: DESIGN_TOKENS.spacing[5],
                  textAlign: 'center',
                  backgroundColor: COLORS.bgSecondary,
                  cursor: 'pointer',
                  transition: `border-color ${DESIGN_TOKENS.motion.durations.fast} ease`,
                  ':hover': {
                    borderColor: COLORS.primary
                  }
                })}
                onClick={() => document.getElementById('photo-input').click()}
                onMouseEnter={(e) => e.target.style.borderColor = COLORS.primary}
                onMouseLeave={(e) => e.target.style.borderColor = COLORS.borderMedium}
              >
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: DESIGN_TOKENS.spacing[2] 
                }}>
                  📷
                </div>
                <p style={mergeStyles(TEXT_STYLES.body, { 
                  margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`
                })}>
                  Click to add a photo
                </p>
                <p style={mergeStyles(TEXT_STYLES.caption, { margin: 0 })}>
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
                    borderRadius: DESIGN_TOKENS.radius.md,
                    border: `2px solid ${COLORS.borderLight}`
                  }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: DESIGN_TOKENS.spacing[2],
                    right: DESIGN_TOKENS.spacing[2],
                    backgroundColor: COLORS.error,
                    color: COLORS.textInverse,
                    border: 'none',
                    borderRadius: DESIGN_TOKENS.radius.full,
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: TEXT_STYLES.caption.fontSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: DESIGN_TOKENS.shadows.md
                  }}
                >
                  ✕
                </button>
                <div style={mergeStyles(TEXT_STYLES.caption, {
                  marginTop: DESIGN_TOKENS.spacing[2],
                  textAlign: 'center'
                })}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                </div>
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
            <label style={TEXT_STYLES.label}>
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
            <div style={mergeStyles(TEXT_STYLES.caption, {
              textAlign: 'right',
              marginTop: DESIGN_TOKENS.spacing[1]
            })}>
              {message.length}/{TEXT_LIMITS.GLYPH_MESSAGE_MAX} characters
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: DESIGN_TOKENS.spacing[3] 
          }}>
            <button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              style={mergeStyles(
                BUTTON_STYLES.base,
                isSubmitting || !message.trim() ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary,
                BUTTON_STYLES.large,
                { flex: 1 }
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
                BUTTON_STYLES.large,
                { flex: 1 }
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