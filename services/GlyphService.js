import { supabase } from '../lib/supabase';
import { LocationService } from './LocationService';

export class GlyphService {
  // Load all active glyphs from database
  static async loadAllGlyphs() {
    try {
      console.log('🔍 Starting loadAllGlyphs...');
      
      const { data, error } = await supabase
        .from('glyphs')
        .select('*')
        .eq('is_active', true);

      console.log('📊 Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ Error loading glyphs:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Loaded glyphs from database:', data?.length || 0);
      console.log('🔍 Individual glyphs:', data);
      
      return data || [];
    } catch (err) {
      console.error('💥 Unexpected error loading glyphs:', err);
      throw err;
    }
  }

  // Load glyphs within a specific radius of user location
  static async loadNearbyGlyphs(userLat, userLng, radiusMeters = 200) {
    try {
      console.log('🎯 Starting loadNearbyGlyphs...');
      console.log('📍 User location:', { lat: userLat, lng: userLng });
      console.log('📏 Search radius:', radiusMeters, 'meters');

      // Load all glyphs first
      const allGlyphs = await this.loadAllGlyphs();
      
      console.log('🗂️ All glyphs loaded, filtering by distance...');

      // Filter glyphs by distance with detailed logging
      const nearbyGlyphs = allGlyphs.filter((glyph, index) => {
        const distance = LocationService.calculateDistance(
          userLat, userLng,
          glyph.latitude, glyph.longitude
        );
        
        const isNearby = distance <= radiusMeters;
        
        console.log(`📍 Glyph ${index + 1}:`, {
          id: glyph.id,
          category: glyph.category,
          location: { lat: glyph.latitude, lng: glyph.longitude },
          distance: `${Math.round(distance)}m`,
          isNearby: isNearby,
          text: glyph.text?.substring(0, 30) + '...'
        });
        
        return isNearby;
      });

      console.log('📊 Summary:');
      console.log(`  📱 Total glyphs in database: ${allGlyphs.length}`);
      console.log(`  📍 Nearby glyphs (within ${radiusMeters}m): ${nearbyGlyphs.length}`);
      console.log(`  🧭 User location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`);
      
      return nearbyGlyphs;
    } catch (err) {
      console.error('💥 Error loading nearby glyphs:', err);
      throw err;
    }
  }

  // Create a new glyph
  static async createGlyph(glyphData) {
    try {
      console.log('✨ Creating glyph:', glyphData);
      
      const { data, error } = await supabase
        .from('glyphs')
        .insert([glyphData])
        .select();

      if (error) {
        console.error('❌ Error creating glyph:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Glyph created successfully:', data);
      return data[0];
    } catch (err) {
      console.error('💥 Unexpected error creating glyph:', err);
      throw err;
    }
  }

  // Get a single glyph by ID
  static async getGlyphById(glyphId) {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .select('*')
        .eq('id', glyphId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching glyph:', error);
        throw error;
      }

      // Add default values for enhanced features
      return {
        ...data,
        rating_avg: data.rating_avg || 0,
        rating_count: data.rating_count || 0,
        comment_count: data.comment_count || 0,
        users: { username: 'Explorer' }
      };
    } catch (err) {
      console.error('Unexpected error fetching glyph:', err);
      throw err;
    }
  }

  // Update an existing glyph
  static async updateGlyph(glyphId, updates) {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .update(updates)
        .eq('id', glyphId)
        .select();

      if (error) {
        console.error('Error updating glyph:', error);
        throw error;
      }

      console.log('Glyph updated successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Unexpected error updating glyph:', err);
      throw err;
    }
  }

  // Soft delete a glyph
  static async deleteGlyph(glyphId) {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .update({ is_active: false })
        .eq('id', glyphId)
        .select();

      if (error) {
        console.error('Error deleting glyph:', error);
        throw error;
      }

      console.log('Glyph deleted successfully:', data);
      return data[0];
    } catch (err) {
      console.error('Unexpected error deleting glyph:', err);
      throw err;
    }
  }

  // Get glyphs by category
  static async getGlyphsByCategory(category, userLat = null, userLng = null, radiusMeters = 200) {
    try {
      let glyphs;
      
      if (userLat && userLng) {
        const nearbyGlyphs = await this.loadNearbyGlyphs(userLat, userLng, radiusMeters);
        glyphs = nearbyGlyphs.filter(glyph => glyph.category === category);
      } else {
        const { data, error } = await supabase
          .from('glyphs')
          .select('*')
          .eq('category', category)
          .eq('is_active', true);

        if (error) throw error;
        glyphs = data || [];
      }

      console.log(`Glyphs in category "${category}":`, glyphs.length);
      return glyphs;
    } catch (err) {
      console.error('Error loading glyphs by category:', err);
      throw err;
    }
  }

  // Legacy method delegates (to maintain compatibility)
  static calculateDistance = LocationService.calculateDistance;
  static isUserNearGlyph = LocationService.isUserNearGlyph;
}