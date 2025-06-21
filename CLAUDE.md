# Daily Scribble - Developer Guide

## Project Overview

**Daily Scribble** is a safe, child-friendly creative platform that provides daily drawing challenges for young artists ages 4-16. The application is designed as a mobile-first Progressive Web App (PWA) with comprehensive safety features, parental oversight, and AI-powered content moderation.

### Core Purpose
- Provide daily creative prompts for children aged 4-16
- Create a safe community for sharing artwork
- Enable parental oversight and control
- Encourage creativity through gamification and achievements

### Target Users
- **Preschoolers** (ages 4-6): Very simple concepts, basic shapes, colors, and familiar objects with large UI elements
- **Kids** (ages 7-10): Simple prompts and engaging activities with age-appropriate complexity
- **Tweens** (ages 11-16): More complex challenges and creative expression opportunities
- **Parents**: Full oversight and management capabilities across all age groups

## Technology Stack

### Frontend
- **Next.js**: 15.3.4 (App Router, TypeScript)
- **React**: 19.0.0 with modern server/client components
- **Tailwind CSS**: 4.x with custom design system
- **TypeScript**: 5.x with strict mode
- **PWA**: next-pwa 5.6.0 for offline functionality

### Backend & Services
- **Database**: Supabase (PostgreSQL 15) with Row Level Security
- **Authentication**: Supabase Auth + custom PIN system
- **Storage**: Supabase Storage for artwork images
- **AI Services**: OpenAI GPT-4o-mini for content generation and moderation
- **Real-time**: Supabase Realtime for live updates

### Key Dependencies
- **react-hook-form**: 7.58.1 + zod 3.25.67 (Form handling and validation)
- **@hookform/resolvers**: 5.1.1 (Form validation resolvers)
- **lucide-react**: 0.518.0 (Icon library)
- **react-dropzone**: 14.3.8 (File upload handling)
- **browser-image-compression**: 2.0.2 (Client-side image optimization)
- **bcryptjs**: 3.0.2 (PIN hashing for child authentication)
- **@supabase/auth-helpers-nextjs**: 0.10.0 (Supabase Next.js integration)
- **@supabase/supabase-js**: 2.50.0 (Supabase JavaScript client)
- **openai**: 5.5.1 (OpenAI API integration)
- **workbox-webpack-plugin**: 7.3.0 (PWA service worker generation)

### Development Tools
- **Turbopack**: Fast development bundler (enabled via `--turbopack` flag)
- **ESLint**: 9.x with Next.js configuration
- **TypeScript**: 5.x with strict mode and ES2017 target
- **Tailwind CSS**: 4.x with PostCSS integration

## App Functionality

### Core Features

#### Daily Creative Challenges
- **Two daily challenges**: Daily Challenge 1 and Daily Challenge 2 with varying difficulty levels
- **Free Draw System**: Unlimited creative expression with AI-powered inspiration prompts
- **AI-generated prompts**: Using GPT-4o-mini with age-appropriate themes across 6 categories
- **Upload limits**: One artwork per slot per day (2 daily challenges + unlimited free draw)
- **Age-specific content**: Different prompt complexity across three age groups (preschoolers, kids, tweens)
- **Motor skill development**: Basic shape and color exercises for preschoolers
- **Developmental progression**: Content that grows with children from ages 4-16
- **Inspiration Categories**: Animals, Nature, Fantasy, Objects, Emotions, and Activities

#### Authentication System
**Dual authentication model**:
- **Parents**: Email-based OTP via Supabase Auth (no passwords)
- **Children**: Username + 4-digit PIN system with session management

#### Community Features
- **Moderated gallery**: AI + manual content moderation with real-time status updates
- **Like system**: Children can appreciate each other's artwork (cannot like own posts)
- **View tracking**: Engagement metrics for popular content and trending detection
- **Search & filtering**: By time slot, difficulty, date, and search terms
- **Trending System**: Community-driven prompt discovery and remix functionality
- **Community Remix**: Users can create artwork based on popular community prompts
- **Prompt-Specific Pages**: Dedicated pages showing all artwork for specific challenges

#### Leaderboard System
**Eight Competitive Categories**:
- **Weekly Creative**: Most uploads in current week
- **Weekly Loved**: Most likes received in current week
- **Dedication Champions**: Longest current creation streaks
- **Monthly Creative**: Most uploads in current month
- **Monthly Loved**: Most likes received in current month
- **Rising Stars**: New artists with rapid engagement growth
- **Growth Champions**: Most improved artists (week-over-week metrics)
- **Community Heroes**: Most likes given to other artists

**Leaderboard Features**:
- **Real-time Updates**: Live ranking changes and position tracking
- **Historical Data**: Previous week/month performance comparison
- **Fair Competition**: Age-appropriate grouping and balanced metrics
- **Recognition System**: Special badges for leaderboard achievements

#### Gamification & Achievements
**Five Achievement Categories**:
- **Creation**: Upload milestones (1, 5, 10, 25, 50, 100 artworks)
- **Social**: Like giving/receiving achievements and community engagement
- **Streak**: Consecutive daily creation (3, 7, 14, 30 days)
- **Skill**: Time slot completion and challenge variety achievements
- **Special**: Unique accomplishments and seasonal achievements

**Achievement System Features**:
- **Rarity Levels**: Common, Rare, Epic, and Legendary achievements
- **Point System**: Each achievement awards points contributing to user levels
- **Progress Tracking**: Visual progress bars and completion status
- **Level Progression**: Non-linear level system with increasing point requirements

### Safety Features
- **Multi-layered content moderation**: OpenAI API + manual review
- **Parental oversight**: Full control over child profiles and content
- **No direct communication**: Children only share artwork, no messaging
- **COPPA compliance**: Parental consent required for all child accounts
- **Secure sessions**: HTTP-only cookies with proper expiration

## Development Setup

### Environment Variables
Create `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Cron Job Security
CRON_SECRET=your_secure_cron_secret
```

### Quick Start
```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Setup
1. Create new Supabase project
2. Run schema from `database/schema.sql` in SQL Editor
3. Follow migration instructions in `scripts/run-migration.md`
4. For existing databases, run `database/migration-add-preschooler-age-group.sql`
5. Configure storage bucket policies for public artwork access

## Architecture Overview

### Database Schema
**Core tables**:
- `parent_accounts` - Parent user records linked to Supabase Auth
- `child_profiles` - Child accounts with PIN authentication (supports preschoolers, kids, tweens)
- `prompts` - Daily drawing prompts with time slots and age targeting (all three age groups)
- `posts` - Artwork submissions with moderation status
- `child_likes` - Like relationships with proper constraints
- `achievements` + `user_achievements` - Gamification system
- `user_stats` - Aggregated metrics (streaks, levels, points)
- `daily_upload_limits` - Enforcement of upload restrictions
- `free_draw_inspirations` - Creative inspiration prompts by age group

### API Structure
**32 API endpoints organized across 10 functional categories:**

#### Authentication Endpoints (5)
- **POST** `/api/auth/parent/signin` - Send OTP code to parent email
- **POST** `/api/auth/parent/verify` - Verify OTP code and create parent session
- **POST** `/api/auth/parent/signout` - Sign out parent and clear session
- **POST** `/api/auth/child/signin` - Child username/PIN authentication
- **POST** `/api/auth/child/signout` - Sign out child and clear session

#### Content Management (5)
- **POST** `/api/posts` - Create new artwork post with automatic AI moderation
- **GET** `/api/posts` - Fetch child's own posts with filtering and pagination
- **POST** `/api/posts/like` - Like/unlike artwork posts with optimistic updates
- **POST** `/api/posts/view` - Record view count for engagement tracking
- **GET** `/api/posts/upload-status` - Check daily upload limits and slot availability

#### Prompt & Challenge System (2)
- **GET** `/api/prompts/daily` - Fetch daily challenges with AI fallback and age filtering
- **GET** `/api/prompts/shared-daily` - Fetch shared daily prompts across age groups

#### Upload & Storage (1)
- **POST** `/api/upload` - File upload with automatic compression and AI moderation

#### Gallery & Discovery (1)
- **GET** `/api/gallery` - Browse community artwork with advanced filtering and pagination

#### Child Profile Management (4)
- **GET** `/api/child/achievements` - Fetch child's achievements, badges, and progress
- **GET** `/api/child/artworks` - Fetch child's complete artwork collection
- **GET** `/api/child/profile` - Get child profile information and settings
- **GET** `/api/child/stats` - Get child's statistics, level, and performance metrics

#### Parent Dashboard (4)
- **GET** `/api/parent/children` - List all children under parental supervision
- **GET** `/api/parent/children/[childId]` - Get specific child's detailed information
- **GET** `/api/parent/children/[childId]/artwork` - Get child's artwork for parental review
- **DELETE** `/api/parent/artwork/[artworkId]` - Delete child's artwork (parental control)

#### Community Features (2)
- **GET** `/api/community/trending` - Get trending prompts with community engagement metrics
- **GET** `/api/community/prompt/[promptId]` - Get specific prompt with all community artwork

#### Leaderboards & Competition (1)
- **GET** `/api/leaderboards/weekly` - Weekly leaderboards across 8 categories (uploads, likes, streaks, etc.)

#### Free Draw System (1)
- **GET** `/api/free-draw/inspiration` - Get creative inspiration prompts from 6 categories

#### Administrative Functions (2)
- **POST** `/api/admin/generate-prompts` - Manually trigger daily prompt generation
- **POST** `/api/admin/moderate-pending` - Moderate pending content with bulk actions

#### Automated Tasks (1)
- **POST** `/api/cron/generate-daily-prompts` - Automated daily prompt generation (4:00 AM UTC)

#### Development & Debug (3)
- **GET** `/api/children/list` - List children (utility endpoint for development)
- **GET** `/api/debug/check-table` - Database table debugging and health checks
- **GET** `/api/debug/supabase` - Supabase connection testing and configuration validation
- **POST** `/api/debug/test-otp` - OTP system testing and email delivery verification

### Component Architecture
**Centralized Layout Pattern**:
- **ChildLayout Component** (`src/components/ChildLayout.tsx`): Main layout wrapper for all child-facing pages
- **Real-time Features**: Live stats fetching from `/api/child/stats` and `/api/child/achievements`
- **Level System**: Non-linear progression with sophisticated point calculation
- **Responsive Design**: Mobile-first with collapsible sidebar and backdrop overlay
- **Page-Level Components**: Individual components per page rather than shared UI library

**Gamification Integration**:
- **Level Calculation**: Dynamic level progression based on achievement points
- **Progress Tracking**: Real-time progress bars and "points to next level" display
- **User Stats**: Combined data from multiple API endpoints for comprehensive dashboard

### Authentication Middleware
Located in `src/middleware.ts`:
- **Parent routes** (`/parent/*`): Requires `parent_auth` HTTP-only cookie
- **Child routes** (`/child-home/*`, `/child/*`): Requires `child_auth` HTTP-only cookie
- **Session Duration**: 7-day cookie expiration for both parent and child sessions
- **Security Features**: Secure flag in production, SameSite=Strict policy
- **Redirect Logic**: Invalid sessions redirect to appropriate authentication pages

### Content Moderation Pipeline
1. **Upload**: Image immediately sent to OpenAI `omni-moderation-latest` model
2. **Categories**: Sexual, violent, self-harm, harassment, hate speech detection
3. **Child-Specific Thresholds**: Lower tolerance levels appropriate for children's content
4. **Status assignment**: 
   - `approved` - Visible in gallery and community features
   - `rejected` - Hidden from public view with parental notification
   - `pending` - Awaiting manual review (API failures or edge cases)
5. **Fallback behavior**: Auto-approve in development mode when API key missing
6. **Real-time Updates**: Moderation status reflected immediately in user interface
7. **Parental Override**: Parents can review and manage children's rejected content

## Deployment Configuration

### Vercel Setup
- **Build optimization**: ESLint errors ignored during builds via `ignoreDuringBuilds: true`
- **Image processing**: Sharp for server-side optimization via `serverExternalPackages: ['sharp']`
- **Image Configuration**: Remote patterns configured for `*.supabase.co` hostname
- **Cron jobs**: Daily prompt generation at 4:00 AM UTC via `vercel.json`
- **Environment**: Production vs development moderation modes
- **SEO Optimization**: OpenGraph and Twitter Card meta tags configured
- **Font Loading**: Google Fonts (Inter, Poppins) with optimal loading strategy

### Development Configuration
- **Turbopack**: Fast development bundler enabled via `--turbopack` flag
- **TypeScript**: ES2017 target with bundler module resolution
- **Path Aliases**: `@/*` mapped to `./src/*` for clean imports
- **PWA Ready**: Dependencies configured but manifest files need completion

### Build & Deployment Features
- **Next.js 15.3.4**: App Router with server/client component optimization
- **Static Generation**: Pre-rendered pages for optimal performance
- **Middleware**: Route-based authentication enforcement
- **Environmental Variables**: Comprehensive `.env.example` provided
- **Database Migrations**: SQL schema and migration scripts included

### Automated Tasks
**Daily prompt generation** (`/api/cron/generate-daily-prompts`):
- Generates 6 prompts daily (3 difficulties × 3 age groups × 2 daily slots)
- Uses OpenAI with themed templates for all three age groups
- Fallback to predefined prompts on API failure

**Manual moderation script**:
```bash
node scripts/moderate-pending-posts.js
```

## Development Workflows

### Adding New Features
1. Update database schema if needed (with proper RLS policies)
2. Create API routes in appropriate `/api/` subdirectory
3. Implement frontend components with proper TypeScript types
4. Add authentication middleware protection
5. Test content moderation pipeline if applicable
6. **Always update CLAUDE.md when making changes**

### Database Migrations
1. Write migration SQL in `database/` directory
2. Test thoroughly in development environment
3. Update TypeScript types in `src/types/database.ts`
4. Deploy to staging environment for validation
5. Apply to production with proper rollback plan

### Common Debugging
- **Authentication issues**: Check cookie settings and middleware configuration
- **Image upload failures**: Verify Supabase storage policies and OpenAI API key
- **Cron job problems**: Ensure `CRON_SECRET` matches Vercel configuration
- **Database errors**: Check RLS policies and function permissions
- **Moderation pipeline**: Verify OpenAI API key and fallback behavior

### Code Quality Standards
- **TypeScript**: Strict mode with comprehensive typing
- **Error handling**: Consistent API error responses with proper status codes
- **Security**: Row Level Security policies on all user-accessible tables
- **Performance**: Image compression, pagination, and optimized queries
- **Accessibility**: Alt text requirements and semantic HTML

## Key Business Logic

### Challenge Slot System
- **Daily Challenge 1**: First daily prompt with age-appropriate difficulty
- **Daily Challenge 2**: Second daily prompt with varied themes and complexity
- **Free Draw**: Unlimited creative expression with AI-powered inspiration
- **Upload Limits**: One artwork per slot per day (2 daily + unlimited free draw)
- **Slot Tracking**: Database-enforced via `daily_upload_limits` table
- **Timezone**: UTC-4 (Eastern Time) for consistent daily cycles
- **Inspiration Categories**: 60 prompts across Animals, Nature, Fantasy, Objects, Emotions, Activities

### Achievement Calculations
- **Creation streaks**: Consecutive days with at least one upload
- **Social engagement**: Like ratios and community participation
- **Skill progression**: Completion of different difficulty levels
- **Milestone rewards**: Points and badges for reaching upload targets

### Upload Restrictions
- **Daily limits**: Maximum 3 uploads per child per day (one per time slot)
- **File constraints**: 5MB maximum, image formats only
- **Alt text requirement**: Accessibility and content description
- **Duplicate prevention**: Database constraints prevent multiple uploads per slot
- **Re-upload after deletion**: When artwork is deleted, the upload limit is cleared allowing re-upload to the same slot on the same day

## Security Considerations

### Child Safety
- **PIN authentication**: 4-digit PINs with bcrypt hashing (12 rounds)
- **Session management**: 7-day expiration with secure HTTP-only cookies
- **Cookie security**: Secure flag in production, SameSite=Strict policy
- **Content filtering**: AI-powered with child-specific lower thresholds
- **Advanced moderation**: `omni-moderation-latest` model with custom categories
- **Parental control**: Full oversight, content review, and deletion capabilities
- **Upload restrictions**: File size (1KB-10MB), type validation, and daily limits
- **Real-time protection**: Immediate moderation status updates and notifications

### Data Protection
- **Row Level Security**: Comprehensive RLS policies on all user-accessible tables
- **COPPA compliance**: Parental consent workflow with consent flags
- **No PII collection**: Minimal data collection from children (username + PIN only)
- **Secure storage**: Encrypted Supabase database with audit logging
- **File security**: Automatic cleanup of rejected uploads and thumbnails
- **Database functions**: SECURITY DEFINER for elevated privilege operations
- **Atomic operations**: Transaction-safe like/unlike and statistics updates

### Advanced Security Features
- **Dual authentication model**: Separate OTP (parents) and PIN (children) systems
- **Environment-aware security**: Development vs production moderation modes
- **Graceful degradation**: Auto-approval when moderation API unavailable
- **Content categorization**: Multi-category detection (sexual, violence, harassment, etc.)
- **Upload validation**: Comprehensive file type, size, and content checking
- **Session validation**: JSON parsing error handling and automatic cleanup

## Age Group Implementation Details

### Preschoolers (Ages 4-6)
- **Simplified UI**: Larger buttons, more visual elements, minimal text
- **Basic Concepts**: Simple shapes, primary colors, familiar objects
- **Motor Skills**: Focus on large movements and basic drawing techniques
- **Immediate Feedback**: Instant positive reinforcement and simple animations
- **Parental Guidance**: Enhanced oversight with simplified reporting

### Kids (Ages 7-10)
- **Balanced Interface**: Age-appropriate complexity with guided interactions
- **Creative Exploration**: More detailed prompts with imaginative elements
- **Skill Building**: Progressive difficulty and technique introduction
- **Social Learning**: Limited community interaction with strong moderation

### Tweens (Ages 11-16)
- **Advanced Features**: Full platform functionality with creative challenges
- **Self-Expression**: Complex prompts encouraging personal artistic voice
- **Community Engagement**: Active participation in trending and social features
- **Skill Mastery**: Advanced techniques and artistic development

This application represents a production-ready, scalable platform for child-safe creative expression with comprehensive safety measures, sophisticated community features, advanced gamification systems, and modern development practices. The platform includes 32 API endpoints, 8-category leaderboard system, multi-layered content moderation, real-time statistics, and extensive parental oversight capabilities - making it a comprehensive creative community platform designed specifically for children's safety and engagement across three distinct developmental age groups.