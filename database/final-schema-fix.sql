-- Final schema fix - handles views and dependencies
-- Run this in Supabase SQL Editor

-- Step 1: Drop any views that depend on the time_slot column
DROP VIEW IF EXISTS daily_prompts_with_slots CASCADE;

-- Step 2: Drop existing constraints
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_time_slot_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_time_slot_check;  
ALTER TABLE daily_upload_limits DROP CONSTRAINT IF EXISTS daily_upload_limits_time_slot_check;

-- Step 3: Drop the enum type if it exists
DROP TYPE IF EXISTS time_slot_enum CASCADE;

-- Step 4: Clear any existing data 
DELETE FROM daily_upload_limits;
DELETE FROM posts;
DELETE FROM prompts;

-- Step 5: Modify columns to be plain TEXT
ALTER TABLE prompts ALTER COLUMN time_slot TYPE TEXT;
ALTER TABLE posts ALTER COLUMN time_slot TYPE TEXT;
ALTER TABLE daily_upload_limits ALTER COLUMN time_slot TYPE TEXT;

-- Step 6: Add new CHECK constraints
ALTER TABLE prompts ADD CONSTRAINT prompts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE posts ADD CONSTRAINT posts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE daily_upload_limits ADD CONSTRAINT daily_upload_limits_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Step 7: Create the free draw inspirations table
CREATE TABLE IF NOT EXISTS free_draw_inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('animals', 'nature', 'fantasy', 'objects', 'emotions', 'activities')),
  suggestion TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'tweens')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE free_draw_inspirations ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Anyone can view free draw inspirations" ON free_draw_inspirations
  FOR SELECT USING (true);

-- Step 8: Insert sample inspirations (kids)
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  ('animals', 'Your favorite animal wearing a funny hat', 'kids', '🐶'),
  ('animals', 'A cat playing with a ball of yarn', 'kids', '🐱'),
  ('nature', 'A beautiful flower garden with butterflies', 'kids', '🌸'),
  ('nature', 'A rainbow after a rainy day', 'kids', '🌈'),
  ('fantasy', 'A friendly dragon sharing ice cream', 'kids', '🐲'),
  ('fantasy', 'A unicorn in a field of flowers', 'kids', '🦄'),
  ('objects', 'Your favorite toy having an adventure', 'kids', '🧸'),
  ('objects', 'A robot helper doing chores', 'kids', '🤖'),
  ('emotions', 'What happiness looks like to you', 'kids', '😊'),
  ('emotions', 'A picture that shows kindness', 'kids', '💝'),
  ('activities', 'Your favorite sport or game', 'kids', '⚽'),
  ('activities', 'A family picnic in the park', 'kids', '🧺');

-- Insert sample inspirations (tweens)
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  ('animals', 'An animal in an unexpected environment', 'tweens', '🦋'),
  ('animals', 'Your spirit animal in its natural habitat', 'tweens', '🦅'),
  ('nature', 'Your ideal eco-friendly city', 'tweens', '🌿'),
  ('nature', 'A night sky with constellations you create', 'tweens', '⭐'),
  ('fantasy', 'Your own fantasy world with unique rules', 'tweens', '🔮'),
  ('fantasy', 'A steampunk invention you would create', 'tweens', '⚙️'),
  ('objects', 'Technology from 100 years in the future', 'tweens', '🚀'),
  ('objects', 'Your dream room or workspace', 'tweens', '🛏️'),
  ('emotions', 'What growing up feels like', 'tweens', '🌱'),
  ('emotions', 'Your hopes for the future', 'tweens', '🌅'),
  ('activities', 'Your ideal career in action', 'tweens', '💼'),
  ('activities', 'Creating art in an unusual place', 'tweens', '🎨');

-- Step 9: Insert test prompts for today
INSERT INTO prompts (date, age_group, time_slot, difficulty, prompt_text) VALUES
  -- Kids prompts for today
  (CURRENT_DATE, 'kids', 'daily_1', 'easy', 'Draw your favorite animal having a fun adventure! Maybe they''re exploring a magical forest or playing with friends. What exciting things does your animal discover?'),
  (CURRENT_DATE, 'kids', 'daily_2', 'medium', 'Create a picture of the most amazing playground you can imagine! Include slides, swings, and any other fun equipment. What special features would make this playground incredible?'),
  
  -- Tweens prompts for today  
  (CURRENT_DATE, 'tweens', 'daily_1', 'easy', 'Draw yourself in your dream job 10 years from now. What would you be doing? Where would you work? Show yourself doing something amazing in your future career!'),
  (CURRENT_DATE, 'tweens', 'daily_2', 'medium', 'Design the perfect hangout space for you and your friends. What games, activities, or features would it have? Make it the coolest place ever to spend time together!');

-- Step 10: Recreate the view if needed (with new time slots)
CREATE OR REPLACE VIEW daily_prompts_with_slots AS
SELECT 
  p.*,
  CASE 
    WHEN p.time_slot = 'daily_1' THEN 'Challenge 1'
    WHEN p.time_slot = 'daily_2' THEN 'Challenge 2' 
    WHEN p.time_slot = 'free_draw' THEN 'Free Draw'
    ELSE p.time_slot
  END as display_name
FROM prompts p
WHERE p.date = CURRENT_DATE;

SELECT 'Schema migration completed successfully!' as status;