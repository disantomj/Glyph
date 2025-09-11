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
      console.log('📍 Individual glyphs:', data);
      
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

      // Load all glyphs first (later optimization: server-side spatial filtering)
      const allGlyphs = await this.loadAllGlyphs();
      
      console.log('🗂️ All glyphs loaded, filtering by distance...');

      // Filter glyphs by distance with detailed logging
      const nearbyGlyphs = allGlyphs.filter((glyph, index) => {
        const distance = this.calculateDistance(
          userLat, userLng,
          glyph.latitude, glyph.longitude
        );
        
        const isNearby = distance <= radiusMeters;
        
        console.log(`📐 Glyph ${index + 1}:`, {
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
      
      if (nearbyGlyphs.length > 0) {
        console.log('🎉 Nearby glyphs found:', nearbyGlyphs.map(g => ({
          id: g.id,
          category: g.category,
          distance: Math.round(this.calculateDistance(userLat, userLng, g.latitude, g.longitude)) + 'm'
        })));
      } else {
        console.log('😕 No nearby glyphs found. Closest glyphs:');
        const distances = allGlyphs.map(glyph => ({
          id: glyph.id,
          category: glyph.category,
          distance: Math.round(this.calculateDistance(userLat, userLng, glyph.latitude, glyph.longitude)),
          location: { lat: glyph.latitude, lng: glyph.longitude }
        })).sort((a, b) => a.distance - b.distance).slice(0, 3);
        
        console.log('🔍 3 closest glyphs:', distances);
      }
      
      return nearbyGlyphs;
    } catch (err) {
      console.error('💥 Error loading nearby glyphs:', err);
      throw err;
    }
  }

  // Create a new glyph at specific coordinates
  static async createGlyph(glyphData) {
    try {
      console.log('✨ Creating glyph:', glyphData);
      
      const { data, error } = await supabase
        .from('glyphs')
        .insert([glyphData])
        .select(); // Return the created glyph

      if (error) {
        console.error('❌ Error creating glyph:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Glyph created successfully:', data);
      return data[0]; // Return the created glyph
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

  // Record when a user discovers a glyph (gets within range)
  static async recordGlyphDiscovery(userId, glyphId, userLat, userLng) {
    try {
      const { data, error } = await supabase
        .from('glyph_discoveries')
        .insert([{
          user_id: userId,
          glyph_id: glyphId,
          discovery_location_lat: userLat,
          discovery_location_lng: userLng
        }])
        .select();

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error recording glyph discovery:', error);
        throw error;
      }

      console.log('Glyph discovery recorded:', data);
      return data?.[0];
    } catch (err) {
      console.error('Unexpected error recording discovery:', err);
      throw err;
    }
  }

  // Check if user has discovered a glyph
  static async hasUserDiscoveredGlyph(userId, glyphId) {
    try {
      const { data, error } = await supabase
        .from('glyph_discoveries')
        .select('id')
        .eq('user_id', userId)
        .eq('glyph_id', glyphId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking glyph discovery:', err);
      return false;
    }
  }

  // Get all glyphs discovered by a user
  static async getUserDiscoveredGlyphs(userId) {
    try {
      const { data, error } = await supabase
        .from('glyph_discoveries')
        .select(`
          *,
          glyphs!inner (
            id,
            category,
            text,
            latitude,
            longitude,
            created_at,
            is_active
          )
        `)
        .eq('user_id', userId)
        .eq('glyphs.is_active', true);

      if (error) {
        console.error('Error loading discovered glyphs:', error);
        throw error;
      }

      // Extract the glyph data with discovery info
      const discoveredGlyphs = data.map(discovery => ({
        ...discovery.glyphs,
        discovered_at: discovery.discovered_at,
        discovery_location: {
          lat: discovery.discovery_location_lat,
          lng: discovery.discovery_location_lng
        }
      }));

      console.log('User discovered glyphs:', discoveredGlyphs.length);
      return discoveredGlyphs;
    } catch (err) {
      console.error('Error loading discovered glyphs:', err);
      throw err;
    }
  }

  // Search through user's discovered glyphs only
  static async searchDiscoveredGlyphs(userId, searchTerm) {
    try {
      const discoveredGlyphs = await this.getUserDiscoveredGlyphs(userId);
      
      const matchingGlyphs = discoveredGlyphs.filter(glyph =>
        glyph.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        glyph.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log(`Memory search results for "${searchTerm}":`, matchingGlyphs.length);
      return matchingGlyphs;
    } catch (err) {
      console.error('Error searching discovered glyphs:', err);
      throw err;
    }
  }

  // Auto-discover glyphs when user gets nearby (call this periodically)
  static async autoDiscoverNearbyGlyphs(userId, userLat, userLng, discoveryRadius = 50) {
    try {
      const nearbyGlyphs = await this.loadNearbyGlyphs(userLat, userLng, discoveryRadius);
      const discoveries = [];

      for (const glyph of nearbyGlyphs) {
        const alreadyDiscovered = await this.hasUserDiscoveredGlyph(userId, glyph.id);
        
        if (!alreadyDiscovered) {
          const discovery = await this.recordGlyphDiscovery(userId, glyph.id, userLat, userLng);
          if (discovery) {
            discoveries.push({ glyph, discovery });
          }
        }
      }

      if (discoveries.length > 0) {
        console.log('New glyphs discovered:', discoveries.length);
      }

      return discoveries;
    } catch (err) {
      console.error('Error auto-discovering glyphs:', err);
      return [];
    }
  }
}