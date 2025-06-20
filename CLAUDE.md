# Daily Scribble - Developer Guide

## Project Overview

**Daily Scribble** is a safe, child-friendly creative platform that provides daily drawing challenges for young artists. The application is designed as a mobile-first Progressive Web App (PWA) with comprehensive safety features, parental oversight, and AI-powered content moderation.

### Core Purpose
- Provide daily creative prompts for children aged 6-16
- Create a safe community for sharing artwork
- Enable parental oversight and control
- Encourage creativity through gamification and achievements

### Target Users
- **Kids** (ages 6-10): Simpler prompts and interface
- **Tweens** (ages 11-16): More complex challenges
- **Parents**: Full oversight and management capabilities

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
- **lucide-react**: 0.518.0 (Icon library)
- **react-dropzone**: 14.3.8 (File upload handling)
- **browser-image-compression**: 2.0.2 (Client-side image optimization)
- **bcryptjs**: 3.0.2 (PIN hashing for child authentication)

## App Functionality

### Core Features

#### Daily Creative Challenges
- **Three time slots per day**: Morning (easy), Afternoon (medium), Evening (hard)
- **AI-generated prompts**: Using GPT-4o-mini with age-appropriate themes
- **Upload limits**: One artwork per time slot per day to encourage quality
- **Age-specific content**: Different prompt complexity for kids vs tweens

#### Authentication System
**Dual authentication model**:
- **Parents**: Email-based OTP via Supabase Auth (no passwords)
- **Children**: Username + 4-digit PIN system with session management

#### Community Features
- **Moderated gallery**: AI + manual content moderation
- **Like system**: Children can appreciate each other's artwork
- **View tracking**: Engagement metrics for popular content
- **Search & filtering**: By time slot, difficulty, and date

#### Gamification & Achievements
- **Creation badges**: Upload milestones (1, 5, 10, 25, 50, 100 artworks)
- **Social engagement**: Like giving/receiving achievements
- **Streak system**: Consecutive daily creation (3, 7, 14, 30 days)
- **Skill progression**: Time slot completion and daily triple achievements

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
4. Configure storage bucket policies for public artwork access

## Architecture Overview

### Database Schema
**Core tables**:
- `parent_accounts` - Parent user records linked to Supabase Auth
- `child_profiles` - Child accounts with PIN authentication
- `prompts` - Daily drawing prompts with time slots and age targeting
- `posts` - Artwork submissions with moderation status
- `child_likes` - Like relationships with proper constraints
- `achievements` + `user_achievements` - Gamification system
- `user_stats` - Aggregated metrics (streaks, levels, points)
- `daily_upload_limits` - Enforcement of upload restrictions

### API Structure
**Authentication endpoints**:
- `/api/auth/parent/*` - Parent OTP authentication
- `/api/auth/child/*` - Child PIN authentication

**Content endpoints**:
- `/api/prompts/daily` - Fetch daily challenges with AI fallback
- `/api/upload` - Artwork upload with automatic moderation
- `/api/gallery` - Browse community artwork with pagination
- `/api/posts/*` - Like, view, and content management

**Admin/Parent endpoints**:
- `/api/parent/*` - Child profile management
- `/api/admin/*` - Moderation and administrative functions

### Content Moderation Pipeline
1. **Upload**: Image immediately sent to OpenAI moderation API
2. **Categories**: Sexual, violent, harmful, hateful content detection
3. **Status assignment**: 
   - `approved` - Visible in gallery
   - `rejected` - Hidden from public view
   - `pending` - Awaiting manual review (API failures)
4. **Fallback behavior**: Auto-approve if no API key (development mode)

### Authentication Middleware
Located in `src/middleware.ts`:
- **Parent routes** (`/parent/*`): Requires Supabase Auth session
- **Child routes** (`/child-home/*`, `/child/*`): Requires PIN session
- **Server-side validation**: HTTP-only cookie verification

## Deployment Configuration

### Vercel Setup
- **Build optimization**: ESLint errors ignored during builds
- **Image processing**: Sharp for server-side optimization
- **Cron jobs**: Daily prompt generation at 4:00 AM UTC
- **Environment**: Production vs development moderation modes

### Automated Tasks
**Daily prompt generation** (`/api/cron/generate-daily-prompts`):
- Generates 6 prompts daily (3 difficulties × 2 age groups)
- Uses OpenAI with themed templates
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

### Time Slot System
- **Morning** (6 AM - 12 PM): Easy, energizing prompts
- **Afternoon** (12 PM - 6 PM): Medium, adventure-themed prompts  
- **Evening** (6 PM - 12 AM): Hard, reflective prompts
- **Timezone**: UTC-4 (Eastern Time) for consistent daily cycles

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

## Security Considerations

### Child Safety
- **PIN authentication**: 4-digit PINs with bcrypt hashing (12 rounds)
- **Session management**: 24-hour expiration with secure HTTP-only cookies
- **Content filtering**: AI-powered with human moderation backup
- **Parental control**: Full oversight and deletion capabilities

### Data Protection
- **Row Level Security**: Database-level access control
- **COPPA compliance**: Parental consent workflow
- **No PII collection**: Minimal data collection from children
- **Secure storage**: Encrypted database with access logging

This application represents a production-ready, scalable platform for child-safe creative expression with comprehensive safety measures and modern development practices.