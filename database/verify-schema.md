# Schema Verification Checklist

## Tables and Columns Verification

Run these queries in your Supabase SQL Editor to verify the migration was successful:

### 1. Check All Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- achievements
- child_likes
- child_profiles  
- daily_upload_limits ✅ NEW
- free_draw_inspirations ✅ NEW
- parent_accounts
- posts
- prompts
- user_achievements
- user_stats

### 2. Verify Prompts Table Schema
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prompts' 
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid, not null)
- date (date, not null) 
- age_group (text, not null)
- difficulty (text, not null)
- prompt_text (text, not null)
- **time_slot** (text, not null) ✅ NEW
- created_at (timestamptz, default now())

### 3. Verify Posts Table Schema  
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid, not null)
- child_id (uuid, not null)  
- prompt_id (uuid, nullable)
- image_url (text, not null)
- thumbnail_url (text, nullable)
- alt_text (text, not null)
- **time_slot** (text, nullable) ✅ NEW
- created_at (timestamptz, default now())
- likes_count (integer, default 0)
- moderation_status (text, default 'pending')

### 4. Verify Daily Upload Limits Table
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_upload_limits' 
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid, not null)
- child_id (uuid, not null)
- date (date, not null)
- time_slot (text, not null)
- uploads_count (integer, default 0)
- last_upload_at (timestamptz, nullable)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### 5. Verify Free Draw Inspirations Table
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'free_draw_inspirations' 
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid, not null)
- category (text, not null)
- suggestion (text, not null)
- age_group (text, not null)
- emoji (text, not null)
- created_at (timestamptz, default now())

### 6. Check Constraints
```sql
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('prompts', 'posts', 'daily_upload_limits', 'free_draw_inspirations')
ORDER BY tc.table_name, tc.constraint_type;
```

### 7. Verify RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('daily_upload_limits', 'free_draw_inspirations')
ORDER BY tablename, policyname;
```

**Expected policies:**
- daily_upload_limits: "System can manage upload limits", "Parents can view their children's limits"
- free_draw_inspirations: "Anyone can view free draw inspirations"

### 8. Check Sample Data
```sql
-- Verify free draw inspirations were populated
SELECT category, age_group, count(*) as count
FROM free_draw_inspirations 
GROUP BY category, age_group 
ORDER BY category, age_group;
```

**Expected counts:**
- Each category should have entries for both 'kids' and 'tweens'
- Total should be 60 records (6 categories × 2 age groups × 5 suggestions each)

### 9. Test Time Slot Constraints
```sql
-- This should fail with constraint violation
INSERT INTO prompts (date, age_group, difficulty, prompt_text, time_slot) 
VALUES ('2025-06-20', 'kids', 'easy', 'Test prompt', 'invalid_slot');
```

### 10. Verify Foreign Key Relationships
```sql
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('daily_upload_limits', 'posts', 'prompts')
ORDER BY tc.table_name;
```

## TypeScript Type Verification

The following TypeScript interfaces should now match the database schema exactly:

✅ **prompts table** - includes time_slot field  
✅ **posts table** - includes time_slot field (nullable)  
✅ **daily_upload_limits table** - complete interface defined  
✅ **free_draw_inspirations table** - complete interface defined  

All types in `/src/types/database.ts` are now synchronized with the actual database schema.

## Manual Testing

After verifying the schema, test these workflows:

1. **Upload Limit Enforcement**: Try uploading multiple artworks to the same time slot
2. **Free Draw Inspirations**: Query the inspirations table by category and age group
3. **Time Slot Categorization**: Create prompts with different time_slot values
4. **Historical Data**: Verify existing posts still work with NULL time_slot values

## Rollback Plan

If issues arise, you can rollback by:

1. Drop new tables:
   ```sql
   DROP TABLE IF EXISTS daily_upload_limits CASCADE;
   DROP TABLE IF EXISTS free_draw_inspirations CASCADE;
   ```

2. Remove new columns:
   ```sql
   ALTER TABLE prompts DROP COLUMN IF EXISTS time_slot;
   ALTER TABLE posts DROP COLUMN IF EXISTS time_slot;
   ```

3. Restore from backup if available

**Note**: Only rollback if critical issues are discovered. The migration is designed to be backward compatible.