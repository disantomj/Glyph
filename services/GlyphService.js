import { supabase } from '../lib/supabase';

export class GlyphService {
  // Calculate distance between two coordinates (in meters) using Haversine formula
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Load all active glyphs from database
  static async loadAllGlyphs() {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading glyphs:', error);
        throw error;
      }

      console.log('Loaded all glyphs from database:', data?.length);
      return data || [];
    } catch (err) {
      console.error('Unexpected error loading glyphs:', err);
      throw err;
    }
  }

  // Load glyphs within a specific radius of user location
  static async loadNearbyGlyphs(userLat, userLng, radiusMeters = 200) {
    try {
      // Load all glyphs first (later optimization: server-side spatial filtering)
      const allGlyphs = await this.loadAllGlyphs();

      // Filter glyphs by distance
      const nearbyGlyphs = allGlyphs.filter(glyph => {
        const distance = this.calculateDistance(
          userLat, userLng,
          glyph.latitude, glyph.longitude
        );
        return distance <= radiusMeters;
      });

      console.log('Total glyphs in database:', allGlyphs.length);
      console.log(`Nearby glyphs (within ${radiusMeters}m):`, nearbyGlyphs.length);
      console.log('User location:', { lat: userLat, lng: userLng });
      
      return nearbyGlyphs;
    } catch (err) {
      console.error('Error loading nearby glyphs:', err);
      throw err;
    }
  }

  // Create a new glyph at specific coordinates
  static async createGlyph(glyphData) {
    try {
      const { data, error } = await supabase
        .from('glyphs')
        .insert([glyphData])
        .select(); // Return the created glyph

      if (error) {
        console.error('Error creating glyph:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Glyph created successfully:', data);
      return data[0]; // Return the created glyph
    } catch (err) {
      console.error('Unexpected error creating glyph:', err);
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

      return data;
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

  // Soft delete a glyph (set is_active to false)
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

  // Check if user is within range of a glyph
  static isUserNearGlyph(userLat, userLng, glyph, radiusMeters = 20) {
    const distance = this.calculateDistance(
      userLat, userLng,
      glyph.latitude, glyph.longitude
    );
    return distance <= radiusMeters;
  }

  // Get glyphs by category
  static async getGlyphsByCategory(category, userLat = null, userLng = null, radiusMeters = 200) {
    try {
      let glyphs;
      
      if (userLat && userLng) {
        // Load nearby glyphs and filter by category
        const nearbyGlyphs = await this.loadNearbyGlyphs(userLat, userLng, radiusMeters);
        glyphs = nearbyGlyphs.filter(glyph => glyph.category === category);
      } else {
        // Load all glyphs and filter by category
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

  // Search glyphs by text content
  static async searchGlyphs(searchTerm, userLat = null, userLng = null, radiusMeters = 200) {
    try {
      let glyphs;
      
      if (userLat && userLng) {
        // Search within nearby glyphs
        const nearbyGlyphs = await this.loadNearbyGlyphs(userLat, userLng, radiusMeters);
        glyphs = nearbyGlyphs.filter(glyph => 
          glyph.text?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        // Search all glyphs
        const { data, error } = await supabase
          .from('glyphs')
          .select('*')
          .textSearch('text', searchTerm)
          .eq('is_active', true);

        if (error) throw error;
        glyphs = data || [];
      }

      console.log(`Search results for "${searchTerm}":`, glyphs.length);
      return glyphs;
    } catch (err) {
      console.error('Error searching glyphs:', err);
      throw err;
    }
  }
}