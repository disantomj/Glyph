import { supabase } from '../lib/supabase';
import { LocationService } from './LocationService';

export class DiscoveryService {
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
          glyphs!inner (*)
        `)
        .eq('user_id', userId)
        .eq('glyphs.is_active', true);

      if (error) {
        console.error('Error loading discovered glyphs:', error);
        throw error;
      }

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

  // Auto-discover glyphs when user gets nearby (call this periodically)
  static async autoDiscoverNearbyGlyphs(userId, userLat, userLng, discoveryRadius = 50) {
    try {
      // This would need to be imported to avoid circular dependency
      // For now, we'll keep this method simple
      const { GlyphService } = await import('./GlyphService');
      
      const nearbyGlyphs = await GlyphService.loadNearbyGlyphs(userLat, userLng, discoveryRadius);
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

  // Get discovery statistics for a user
  static async getUserDiscoveryStats(userId) {
    try {
      const { data, error } = await supabase
        .from('glyph_discoveries')
        .select('id, discovered_at, glyphs!inner(category)')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading discovery stats:', error);
        return {
          totalDiscoveries: 0,
          categoriesDiscovered: {},
          firstDiscovery: null,
          lastDiscovery: null
        };
      }

      const categoriesDiscovered = {};
      data.forEach(discovery => {
        const category = discovery.glyphs.category;
        categoriesDiscovered[category] = (categoriesDiscovered[category] || 0) + 1;
      });

      const dates = data.map(d => new Date(d.discovered_at)).sort();

      return {
        totalDiscoveries: data.length,
        categoriesDiscovered,
        firstDiscovery: dates[0] || null,
        lastDiscovery: dates[dates.length - 1] || null
      };
    } catch (err) {
      console.error('Error loading discovery stats:', err);
      return {
        totalDiscoveries: 0,
        categoriesDiscovered: {},
        firstDiscovery: null,
        lastDiscovery: null
      };
    }
  }
}