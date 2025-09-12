import { supabase } from '../lib/supabase';

export class StorageService {
  // Upload photo to Supabase Storage
  static async uploadGlyphPhoto(file, glyphId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${glyphId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('glyph-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('glyph-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw err;
    }
  }

  // Delete photo from Supabase Storage
  static async deleteGlyphPhoto(photoUrl) {
    try {
      // Extract file path from URL
      const url = new URL(photoUrl);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments[pathSegments.length - 1];

      const { error } = await supabase.storage
        .from('glyph-photos')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting photo:', error);
        throw error;
      }

      console.log('Photo deleted successfully:', filePath);
      return true;
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  }

  // Get signed URL for private files (if needed)
  static async getSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from('glyph-photos')
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Error creating signed URL:', err);
      throw err;
    }
  }

  // Validate file before upload
  static validateFile(file, maxSizeBytes = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Upload multiple files
  static async uploadMultipleFiles(files, folder = '') {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}${Date.now()}_${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('glyph-photos')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('glyph-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err) {
      console.error('Error uploading multiple files:', err);
      throw err;
    }
  }

  // Get file info
  static async getFileInfo(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('glyph-photos')
        .list(filePath.substring(0, filePath.lastIndexOf('/')), {
          search: filePath.split('/').pop()
        });

      if (error) {
        throw error;
      }

      return data[0] || null;
    } catch (err) {
      console.error('Error getting file info:', err);
      return null;
    }
  }
}