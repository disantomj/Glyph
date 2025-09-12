import { supabase } from '../lib/supabase';

export class InteractionService {
  // Rate a glyph (1-5 stars)
  static async rateGlyph(glyphId, userId, rating) {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { data, error } = await supabase
        .from('glyph_ratings')
        .upsert({
          glyph_id: glyphId,
          user_id: userId,
          rating: rating,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Error rating glyph (table may not exist):', error);
        throw error;
      }

      console.log('Glyph rated successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Rating feature not available - check database schema:', err);
      throw err;
    }
  }

  // Get user's rating for a specific glyph
  static async getUserRating(glyphId, userId) {
    try {
      const { data, error } = await supabase
        .from('glyph_ratings')
        .select('rating')
        .eq('glyph_id', glyphId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user rating (table may not exist):', error);
        return null;
      }

      return data?.rating || null;
    } catch (err) {
      console.error('Rating feature not available:', err);
      return null;
    }
  }

  // Add comment to a glyph
  static async addComment(glyphId, userId, comment) {
    try {
      if (!comment || comment.trim().length === 0) {
        throw new Error('Comment cannot be empty');
      }

      const { data, error } = await supabase
        .from('glyph_comments')
        .insert({
          glyph_id: glyphId,
          user_id: userId,
          comment: comment.trim()
        })
        .select('*');

      if (error) {
        console.error('Error adding comment (table may not exist):', error);
        throw error;
      }

      console.log('Comment added successfully:', data);
      return {
        ...data[0],
        users: { username: 'Explorer' }
      };
    } catch (err) {
      console.error('Comment feature not available - check database schema:', err);
      throw err;
    }
  }

  // Get comments for a glyph with proper usernames
  static async getGlyphComments(glyphId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('glyph_comments')
        .select('*')
        .eq('glyph_id', glyphId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching comments (table may not exist):', error);
        return [];
      }

      // Get usernames for each comment
      const commentsWithUsernames = await Promise.all(
        (data || []).map(async (comment) => {
          let commenterUsername = 'Anonymous';
          
          if (comment.user_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('username')
              .eq('id', comment.user_id)
              .single();
            
            if (userData?.username) {
              commenterUsername = userData.username;
            }
          }

          return {
            ...comment,
            users: { username: commenterUsername }
          };
        })
      );

      return commentsWithUsernames;
    } catch (err) {
      console.error('Comment feature not available:', err);
      return [];
    }
  }

  // Delete a comment (if user owns it)
  static async deleteComment(commentId, userId) {
    try {
      const { data, error } = await supabase
        .from('glyph_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }

      console.log('Comment deleted successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }

  // Update a comment (if user owns it)
  static async updateComment(commentId, userId, newComment) {
    try {
      if (!newComment || newComment.trim().length === 0) {
        throw new Error('Comment cannot be empty');
      }

      const { data, error } = await supabase
        .from('glyph_comments')
        .update({ 
          comment: newComment.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      console.log('Comment updated successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }
}