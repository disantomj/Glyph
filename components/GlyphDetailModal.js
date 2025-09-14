import React, { useState, useEffect } from 'react';
import { GlyphService } from '../services/GlyphService';
import { InteractionService } from '../services/InteractionService';
import {
  COLORS,
  BUTTON_STYLES,
  INPUT_STYLES,
  MODAL_STYLES,
  CARD_STYLES,
  TEXT_STYLES,
  DESIGN_TOKENS,
  LAYOUT,
  mergeStyles
} from '../constants/styles';

export default function GlyphDetailModal({ glyph, user, onClose, onGlyphUpdated, onGlyphDeleted }) {
  const [glyphData, setGlyphData] = useState(glyph);
  const [userRating, setUserRating] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Category icons mapping
  const categoryIcons = {
    'Hint': '💡',
    'Warning': '⚠️',
    'Secret': '💰',
    'Praise': '❤️',
    'Lore': '👁️'
  };

  useEffect(() => {
    loadGlyphDetails();
  }, [glyph.id]);

  const loadGlyphDetails = async () => {
    try {
      setLoading(true);
      
      // Load full glyph data
      const fullGlyphData = await GlyphService.getGlyphById(glyph.id);
      setGlyphData(fullGlyphData);
      
      // Load user's rating if logged in
      if (user) {
        const rating = await InteractionService.getUserRating(glyph.id, user.id);
        setUserRating(rating);
      }
      
      // Load comments
      const glyphComments = await InteractionService.getGlyphComments(glyph.id);
      setComments(glyphComments);
      
    } catch (error) {
      console.error('Error loading glyph details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      alert('Please sign in to rate glyphs');
      return;
    }

    try {
      setIsSubmittingRating(true);
      await InteractionService.rateGlyph(glyph.id, user.id, rating);
      setUserRating(rating);
      
      // Reload glyph data to get updated averages
      const updatedGlyph = await GlyphService.getGlyphById(glyph.id);
      setGlyphData(updatedGlyph);
      onGlyphUpdated && onGlyphUpdated(updatedGlyph);
      
    } catch (error) {
      console.error('Error rating glyph:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const comment = await InteractionService.addComment(glyph.id, user.id, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      
      // Update comment count
      setGlyphData(prev => ({
        ...prev,
        comment_count: (prev.comment_count || 0) + 1
      }));
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!user || glyphData.user_id !== user.id) return;

    try {
      setIsDeleting(true);
      await GlyphService.deleteGlyph(glyphData.id);
      
      // Call onGlyphDeleted callback if provided
      if (onGlyphDeleted) {
        onGlyphDeleted(glyphData.id);
      }
      
      // Close the modal
      onClose();
      
      alert('Memory deleted successfully');
    } catch (error) {
      console.error('Error deleting glyph:', error);
      alert('Failed to delete memory. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={interactive ? () => handleRating(i) : undefined}
          style={{
            fontSize: DESIGN_TOKENS.typography.sizes.xl,
            color: i <= rating ? COLORS.warning : COLORS.borderMedium,
            cursor: interactive ? 'pointer' : 'default',
            marginRight: DESIGN_TOKENS.spacing[1],
            transition: `color ${DESIGN_TOKENS.motion.durations.fast} ease`
          }}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={MODAL_STYLES.overlay}>
        <div style={mergeStyles(CARD_STYLES.elevated, {
          padding: DESIGN_TOKENS.spacing[8],
          textAlign: 'center'
        })}>
          <div style={mergeStyles(TEXT_STYLES.body, {
            color: COLORS.textSecondary
          })}>
            Loading glyph details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={MODAL_STYLES.overlay}>
      <div style={MODAL_STYLES.content}>
        {/* Header */}
        <div style={{
          padding: DESIGN_TOKENS.spacing[6],
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: DESIGN_TOKENS.palette.accent.purple.gradient
        }}>
          <div>
            <h2 style={mergeStyles(TEXT_STYLES.h2, { 
              margin: `0 0 ${DESIGN_TOKENS.spacing[1]} 0`,
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing[2],
              color: COLORS.textInverse
            })}>
              {categoryIcons[glyphData.category]} {glyphData.category}
            </h2>
            <p style={mergeStyles(TEXT_STYLES.caption, {
              margin: 0,
              color: `${COLORS.textInverse}CC`
            })}>
              By {glyphData.users?.username || 'Anonymous'} • {new Date(glyphData.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              fontSize: DESIGN_TOKENS.typography.sizes['2xl'],
              cursor: 'pointer',
              color: COLORS.textInverse,
              padding: DESIGN_TOKENS.spacing[1],
              borderRadius: DESIGN_TOKENS.radius.full,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `background-color ${DESIGN_TOKENS.motion.durations.fast} ease`
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: DESIGN_TOKENS.spacing[6]
        }}>
          {/* Photo */}
          {glyphData.photo_url && (
            <div style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
              <img 
                src={glyphData.photo_url} 
                alt="Glyph photo"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: DESIGN_TOKENS.radius.lg,
                  border: `1px solid ${COLORS.borderLight}`,
                  boxShadow: DESIGN_TOKENS.shadows.md
                }}
              />
            </div>
          )}

          {/* Message */}
          <div style={{ marginBottom: DESIGN_TOKENS.spacing[6] }}>
            <p style={mergeStyles(TEXT_STYLES.body, {
              lineHeight: DESIGN_TOKENS.typography.lineHeights.relaxed,
              margin: 0,
              whiteSpace: 'pre-wrap'
            })}>
              {glyphData.text}
            </p>
          </div>

          {/* Rating Section */}
          <div style={mergeStyles(CARD_STYLES.base, {
            marginBottom: DESIGN_TOKENS.spacing[6],
            padding: DESIGN_TOKENS.spacing[5],
            backgroundColor: COLORS.bgSecondary
          })}>
            <h4 style={mergeStyles(TEXT_STYLES.h3, {
              margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`
            })}>
              Rating
            </h4>
            
            {/* Average Rating Display */}
            {glyphData.rating_count > 0 && (
              <div style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}>
                <div style={mergeStyles(LAYOUT.flex, { gap: DESIGN_TOKENS.spacing[2] })}>
                  {renderStars(Math.round(glyphData.rating_avg))}
                  <span style={mergeStyles(TEXT_STYLES.body, { fontWeight: DESIGN_TOKENS.typography.weights.medium })}>
                    {glyphData.rating_avg.toFixed(1)} ({glyphData.rating_count} rating{glyphData.rating_count !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}

            {/* User Rating */}
            {user && (
              <div>
                <p style={mergeStyles(TEXT_STYLES.caption, {
                  marginBottom: DESIGN_TOKENS.spacing[2]
                })}>
                  {userRating ? 'Your rating:' : 'Rate this glyph:'}
                </p>
                <div style={mergeStyles(LAYOUT.flex, { gap: DESIGN_TOKENS.spacing[2] })}>
                  {renderStars(userRating || 0, !isSubmittingRating)}
                  {isSubmittingRating && (
                    <span style={mergeStyles(TEXT_STYLES.caption, { color: COLORS.textMuted })}>
                      Saving...
                    </span>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <p style={mergeStyles(TEXT_STYLES.caption, {
                fontStyle: 'italic',
                color: COLORS.textMuted
              })}>
                Sign in to rate this glyph
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h4 style={mergeStyles(TEXT_STYLES.h3, {
              margin: `0 0 ${DESIGN_TOKENS.spacing[4]} 0`
            })}>
              Comments ({comments.length})
            </h4>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleAddComment} style={{ marginBottom: DESIGN_TOKENS.spacing[5] }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this glyph..."
                  style={mergeStyles(INPUT_STYLES.base, INPUT_STYLES.textarea, {
                    marginBottom: DESIGN_TOKENS.spacing[2]
                  })}
                  maxLength={500}
                />
                <div style={mergeStyles(LAYOUT.flexBetween)}>
                  <span style={mergeStyles(TEXT_STYLES.caption, { color: COLORS.textMuted })}>
                    {newComment.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    style={mergeStyles(
                      BUTTON_STYLES.base,
                      isSubmittingComment || !newComment.trim() ? BUTTON_STYLES.disabled : BUTTON_STYLES.primary,
                      BUTTON_STYLES.small
                    )}
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            {!user && (
              <div style={mergeStyles(CARD_STYLES.base, {
                padding: DESIGN_TOKENS.spacing[4],
                marginBottom: DESIGN_TOKENS.spacing[5],
                textAlign: 'center',
                backgroundColor: COLORS.bgSecondary
              })}>
                <p style={mergeStyles(TEXT_STYLES.caption, { 
                  margin: 0,
                  color: COLORS.textMuted
                })}>
                  Sign in to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {comments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: DESIGN_TOKENS.spacing[8],
                  color: COLORS.textMuted
                }}>
                  <div style={{ 
                    fontSize: DESIGN_TOKENS.typography.sizes['5xl'], 
                    marginBottom: DESIGN_TOKENS.spacing[4] 
                  }}>
                    💭
                  </div>
                  <div style={mergeStyles(TEXT_STYLES.body, { marginBottom: DESIGN_TOKENS.spacing[2] })}>
                    No comments yet
                  </div>
                  <div style={TEXT_STYLES.caption}>
                    Be the first to share your thoughts!
                  </div>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      padding: DESIGN_TOKENS.spacing[4],
                      borderBottom: `1px solid ${COLORS.borderLight}`
                    }}
                  >
                    <div style={mergeStyles(LAYOUT.flexBetween, {
                      marginBottom: DESIGN_TOKENS.spacing[2]
                    })}>
                      <span style={mergeStyles(TEXT_STYLES.caption, { 
                        fontWeight: DESIGN_TOKENS.typography.weights.medium,
                        color: COLORS.textPrimary
                      })}>
                        {comment.users?.username || 'Anonymous'}
                      </span>
                      <span style={mergeStyles(TEXT_STYLES.caption, { color: COLORS.textMuted })}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={mergeStyles(TEXT_STYLES.body, {
                      margin: 0,
                      lineHeight: DESIGN_TOKENS.typography.lineHeights.normal,
                      color: COLORS.textSecondary,
                      whiteSpace: 'pre-wrap'
                    })}>
                      {comment.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: DESIGN_TOKENS.spacing[5],
          borderTop: `1px solid ${COLORS.borderLight}`,
          backgroundColor: COLORS.bgSecondary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: DESIGN_TOKENS.spacing[2]
        }}>
          <div style={mergeStyles(TEXT_STYLES.caption, { color: COLORS.textMuted })}>
            📍 {glyphData.latitude.toFixed(6)}, {glyphData.longitude.toFixed(6)}
          </div>
          
          <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing[2] }}>
            {/* Delete Button - only show for memory owner */}
            {user && glyphData.user_id === user.id && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.error)}
                  >
                    Delete Memory
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={mergeStyles(
                        BUTTON_STYLES.base,
                        isDeleting ? BUTTON_STYLES.disabled : BUTTON_STYLES.error
                      )}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              style={mergeStyles(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}