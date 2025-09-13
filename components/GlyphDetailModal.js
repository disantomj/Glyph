import React, { useState, useEffect } from 'react';
import { GlyphService } from '../services/GlyphService';
import { InteractionService } from '../services/InteractionService';

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
            fontSize: '20px',
            color: i <= rating ? '#ffc107' : '#e9ecef',
            cursor: interactive ? 'pointer' : 'default',
            marginRight: '2px',
            transition: 'color 0.2s'
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
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          Loading glyph details...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px',
          borderBottom: '1px solid #e1e5e9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ 
              margin: '0 0 5px 0', 
              fontSize: '24px', 
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {categoryIcons[glyphData.category]} {glyphData.category}
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#666' 
            }}>
              By {glyphData.users?.username || 'Anonymous'} • {new Date(glyphData.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '25px'
        }}>
          {/* Photo */}
          {glyphData.photo_url && (
            <div style={{ marginBottom: '20px' }}>
              <img 
                src={glyphData.photo_url} 
                alt="Glyph photo"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid #e1e5e9'
                }}
              />
            </div>
          )}

          {/* Message */}
          <div style={{ marginBottom: '25px' }}>
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.5', 
              color: '#333',
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {glyphData.text}
            </p>
          </div>

          {/* Rating Section */}
          <div style={{ 
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
              Rating
            </h4>
            
            {/* Average Rating Display */}
            {glyphData.rating_count > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {renderStars(Math.round(glyphData.rating_avg))}
                  <span style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>
                    {glyphData.rating_avg.toFixed(1)} ({glyphData.rating_count} rating{glyphData.rating_count !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}

            {/* User Rating */}
            {user && (
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {userRating ? 'Your rating:' : 'Rate this glyph:'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {renderStars(userRating || 0, !isSubmittingRating)}
                  {isSubmittingRating && (
                    <span style={{ fontSize: '14px', color: '#666' }}>Saving...</span>
                  )}
                </div>
              </div>
            )}

            {!user && (
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                Sign in to rate this glyph
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
              Comments ({comments.length})
            </h4>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this glyph..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    marginBottom: '10px'
                  }}
                  maxLength={500}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {newComment.length}/500 characters
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isSubmittingComment || !newComment.trim() ? '#ccc' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isSubmittingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            {!user && (
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Sign in to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {comments.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #e1e5e9',
                      lastChild: { borderBottom: 'none' }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>
                        {comment.users?.username || 'Anonymous'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: '#555',
                      whiteSpace: 'pre-wrap'
                    }}>
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
          padding: '20px 25px',
          borderTop: '1px solid #e1e5e9',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            📍 {glyphData.latitude.toFixed(6)}, {glyphData.longitude.toFixed(6)}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Delete Button - only show for memory owner */}
            {user && glyphData.user_id === user.id && (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete Memory
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
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
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}