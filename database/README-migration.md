# Database Schema Migration Guide

## Summary of Changes

This migration synchronizes the database schema with the TypeScript types and documentation requirements. The following changes have been made:

### New Tables Added

1. **`daily_upload_limits`** - Tracks upload counts per child per time slot per day
   - Enforces the "one upload per time slot per day" rule
   - Includes `child_id`, `date`, `time_slot`, `uploads_count`, `last_upload_at`
   - Unique constraint on `(child_id, date, time_slot)`

2. **`free_draw_inspirations`** - Provides creative suggestions for free draw mode  
   - Categorized suggestions (animals, nature, fantasy, objects, emotions, activities)
   - Age-appropriate content for both kids and tweens
   - Includes emoji for visual appeal
   - 60 pre-loaded suggestions (10 per category × 2 age groups × 3 main categories)

### Schema Updates

1. **`prompts` table** - Added `time_slot` column
   - Values: `'daily_1'`, `'daily_2'`, `'free_draw'`
   - Maps to the time-based challenge system (Morning/Afternoon/Evening)
   - NOT NULL constraint after data migration

2. **`posts` table** - Added `time_slot` column  
   - Values: `'daily_1'`, `'daily_2'`, `'free_draw'`, or NULL
   - Tracks which time slot each artwork submission belongs to
   - Nullable to support historical data and flexible posting

### Row Level Security (RLS) Policies

New policies added for the new tables:
- **daily_upload_limits**: System management + parent viewing access
- **free_draw_inspirations**: Public read access for all users

## Migration Steps

### For New Installations
Simply run the updated `database/schema.sql` file which includes all tables and columns.

### For Existing Databases
Run the migration file: `database/migration-add-time-slots-and-tables.sql`

This script will:
1. Add missing columns to existing tables
2. Create new tables with proper constraints
3. Set up RLS policies
4. Populate free_draw_inspirations with sample data
5. Migrate existing prompt data to use time_slot values

### Data Migration Strategy

**Prompts Table Migration:**
- Existing prompts are automatically migrated based on difficulty:
  - `easy` → `daily_1` (Morning slot)  
  - `medium` → `daily_2` (Afternoon slot)
  - `hard` → `free_draw` (Evening/free draw slot)

**Posts Table Migration:**
- Existing posts retain NULL time_slot values for historical compatibility
- New posts will be required to specify time_slot going forward

## Time Slot System

The new time slot system replaces the simple difficulty-based system:

| Time Slot | Description | Difficulty Mapping | Time Window |
|-----------|-------------|-------------------|-------------|
| `daily_1` | Morning Challenge | Easy | 6 AM - 12 PM |
| `daily_2` | Afternoon Challenge | Medium | 12 PM - 6 PM |  
| `free_draw` | Evening/Free Draw | Hard | 6 PM - 12 AM |

## Upload Limit Enforcement

The `daily_upload_limits` table enables the documented restriction of "one upload per time slot per day":

- Each child can upload maximum 3 artworks per day (one per slot)
- Enforced at the application level using this tracking table
- Historical tracking of upload patterns and engagement

## Free Draw Inspirations

60 carefully curated creative prompts across 6 categories:
- **Animals**: Age-appropriate animal drawing suggestions
- **Nature**: Environmental and weather-based themes  
- **Fantasy**: Magical and imaginative concepts
- **Objects**: Everyday items and vehicles brought to life
- **Emotions**: Abstract concepts and feelings visualization
- **Activities**: Action-based and lifestyle scenes

Each suggestion includes:
- Age-appropriate language (kids vs tweens)
- Relevant emoji for visual appeal
- Creative but achievable concepts

## Verification

After running the migration:

1. Check that all tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

2. Verify column additions:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'prompts' AND column_name = 'time_slot';
   ```

3. Confirm RLS policies:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('daily_upload_limits', 'free_draw_inspirations');
   ```

4. Check sample data:
   ```sql
   SELECT category, count(*) FROM free_draw_inspirations GROUP BY category;
   ```

## Breaking Changes

**None** - This migration is fully backward compatible:
- Existing data remains intact
- New columns are nullable or have sensible defaults  
- Application logic handles both old and new data formats
- No API changes required immediately

## Next Steps

After migration, consider updating:
1. API endpoints to utilize the new time_slot system
2. Frontend components to display time-based challenges
3. Upload logic to enforce daily limits using the new table
4. Free draw mode to show inspirational suggestions

The TypeScript types in `src/types/database.ts` are already synchronized with these schema changes.