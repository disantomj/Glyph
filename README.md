# Glyph Explorer

Web Application

A location-based discovery platform that allows users to create and discover contextual memories tied to specific geographic locations. Built with React (Expo web) featuring real-time geolocation, social interactions, and gamified exploration mechanics.

## Features

### Core Functionality
- **Dual Mode Operation**: Toggle between personal memory management and community exploration
- **Web-Based GPS Discovery**: Create and discover content using browser geolocation services
- **Interactive Mapping**: Full-screen map interface powered by Mapbox GL JS
- **Location Validation**: GPS accuracy requirements ensure reliable glyph placement
- **Photo Integration**: Drag-and-drop image upload with preview functionality

### Social & Gamification
- **User Authentication**: Secure sign-up/sign-in with Supabase Auth
- **Discovery Streaks**: Track daily exploration activities with achievement milestones
- **Rating System**: Community-driven content evaluation
- **Comment System**: Social interaction on discovered content
- **User Profiles**: Comprehensive statistics and achievement tracking

### Content Management
- **Categorized Glyphs**: Five content types (Hint, Warning, Secret, Praise, Lore)
- **Advanced Filtering**: Filter personal memories by category and timeframe
- **Content Moderation**: User-owned content management and deletion
- **Rich Media Support**: Image upload with preview and validation

## Technical Architecture

### Frontend
- **Framework**: React (Expo web target) with modern JavaScript
- **State Management**: Custom React hooks for modular state handling
- **Styling**: Comprehensive design system with centralized theming
- **Maps**: Mapbox GL JS for interactive web mapping
- **Browser APIs**: Geolocation API integration for location services

### Backend Services
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage for image management
- **Real-time Features**: Location-based queries with distance calculations

### Key Architectural Patterns
- **Service Layer**: Dedicated services for business logic separation
- **Custom Hooks**: Modular state management (useLocation, useGlyphs, useStreak)
- **Design System**: Token-based styling with theme variants
- **Error Boundaries**: Comprehensive error handling and user feedback

## Project Structure

```
src/
├── components/           # React components
│   ├── AddGlyph.js      # Glyph creation modal
│   ├── Auth.js          # Authentication interface
│   ├── WebMap.js        # Main map component
│   └── ...
├── services/            # Business logic layer
│   ├── GlyphService.js  # Glyph CRUD operations
│   ├── LocationService.js # Distance calculations
│   └── StreakService.js # Gamification logic
├── hooks/               # Custom React hooks
│   ├── useLocation.js   # GPS and location management
│   ├── useGlyphs.js    # Glyph state management
│   └── useStreak.js    # Achievement tracking
├── constants/           # Configuration and styling
│   ├── styles.js       # Design system
│   ├── config.js       # App configuration
│   └── categories.js   # Content categorization
└── lib/
    └── supabase.js     # Database client
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI
- Supabase account
- Mapbox account

### Environment Variables
Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/glyph-explorer.git
cd glyph-explorer

# Install dependencies
npm install

# Start development server
npm start
```

### Database Setup
1. Create a new Supabase project
2. Run the provided SQL migrations to set up tables
3. Configure Row Level Security policies
4. Set up Storage bucket for image uploads

### Deployment
The application is configured for deployment on Vercel with automatic GitHub integration:

```bash
# Build for production
npx expo export --platform web

# Deploy to Vercel
vercel
```

## Development Highlights

### Mobile-First Location Services
- Enhanced permission handling for mobile browsers
- GPS accuracy validation with user feedback
- Responsive error messaging for location access issues

### Scalable Design System
- Token-based styling architecture
- Theme switching capabilities
- Consistent component API across the application

### Performance Optimizations
- Efficient marker rendering with deduplication
- Lazy loading of user-generated content
- Optimized image handling and storage

## Technical Challenges Solved

- **Browser Geolocation**: Implemented robust location permission handling across different browsers
- **Map Performance**: Efficient marker rendering and management for geographic datasets
- **Complex State Management**: Coordinated state across multiple user modes and real-time updates
- **GPS Accuracy Validation**: Location precision requirements to ensure reliable geographic anchoring
- **Design System Architecture**: Scalable styling system with centralized theme management

## Future Roadmap

- **Mobile Application**: Native mobile app with enhanced touch interactions (in development)
- Offline functionality with service workers
- Push notifications for proximity-based discoveries
- Advanced analytics dashboard for exploration patterns
- AR integration for enhanced discovery experience

## Contributing

This project demonstrates full-stack development capabilities including:
- Complex state management and architectural planning
- Real-time geolocation and mapping integration
- Comprehensive user authentication and authorization
- Responsive design system implementation
- Production deployment and optimization

## License

This project is developed as a portfolio demonstration of modern web development practices and technical problem-solving capabilities.

---

**Live Demo**: [Your Deployment URL]  
**Developer**: [Your Name]  
**Contact**: [Your Email]
