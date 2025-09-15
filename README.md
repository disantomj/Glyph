# Glyph Explorer

A location-based discovery platform where users create and discover contextual memories tied to specific geographic coordinates. Demonstrates full-stack development with real-time geolocation, social features, and complex state management.

## Live Application Features

### Dual-Mode Interface
- **Personal Memory Mode**: Private location-based journal with filtering and organization
- **Community Explorer Mode**: Discover content created by other users nearby
- **Seamless Mode Switching**: Dynamic UI adaptation based on user context

### Location Intelligence
- **GPS Integration**: Browser geolocation with accuracy validation
- **Interactive Mapping**: Real-time Mapbox integration with custom markers
- **Proximity Discovery**: Find content within configurable radius distances
- **Location Validation**: Accuracy thresholds prevent unreliable placements

### Social & Gamification
- **User Authentication**: Complete sign-up/sign-in flow with Supabase
- **Discovery Streaks**: Daily exploration tracking with milestone achievements
- **Community Ratings**: Five-star rating system with aggregate scoring
- **Threaded Comments**: User discussions on discovered content
- **Rich User Profiles**: Statistics, achievements, and activity history

### Content Management
- **Categorized Content**: Five content types (Hint, Warning, Secret, Praise, Lore)
- **Photo Integration**: Image upload with preview and cloud storage
- **Advanced Filtering**: Filter personal content by category and timeframe
- **Full CRUD Operations**: Create, read, update, delete with proper authorization

## Technical Implementation

### Architecture Highlights
- **Custom Hook Architecture**: Modular state management (useLocation, useGlyphs, useStreak, useAuth)
- **Service Layer Pattern**: Business logic separation from UI components
- **Centralized Design System**: Token-based styling with theme switching capability
- **Component Composition**: Reusable UI components with consistent APIs

### Technology Stack
- **Frontend**: React (Expo web) with modern JavaScript/ES6+
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage for image management
- **Mapping**: Mapbox GL JS for interactive web maps
- **Deployment**: Vercel with GitHub integration

### Notable Technical Solutions
- **Complex State Orchestration**: Coordinated state across location services, user modes, and real-time updates
- **Browser Geolocation Handling**: Robust permission management and error handling across different browsers
- **Efficient Map Rendering**: Marker deduplication and optimized rendering for geographic datasets
- **Scalable Styling Architecture**: Design token system enabling rapid theme changes and consistent UI
- **Real-time Distance Calculations**: Haversine formula implementation for proximity-based features

## Key Development Challenges

### Location Services Integration
Implemented comprehensive browser geolocation with permission handling, accuracy validation, and user feedback systems to ensure reliable geographic anchoring of content.

### Multi-Modal State Management
Developed custom hook architecture to manage complex application state across personal/community modes, authentication states, and real-time location updates.

### Performance Optimization
Built efficient marker rendering system to handle potentially large datasets of geographic points while maintaining smooth map interactions.

### Design System Architecture
Created modular styling system with centralized theme management, enabling rapid visual changes and consistent component APIs across the application.

## Development Methodology

- **Component-Driven Development**: Built reusable UI components with consistent interfaces
- **Service-Oriented Architecture**: Separated business logic into dedicated service classes
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with interactive features
- **Production Deployment**: Configured automated deployment pipeline with environment management

## Project Scope

This application demonstrates end-to-end development capabilities including:
- Complex frontend state management and architecture
- Real-time geolocation and mapping integration
- Full-stack authentication and authorization
- Database design with security considerations
- File upload and cloud storage integration
- Production deployment and DevOps practices

**Note**: This is a web application optimized for desktop browsers. Mobile optimization is planned for future development.
