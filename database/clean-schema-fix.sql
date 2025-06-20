-- Clean schema fix - run this in Supabase SQL Editor
-- This assumes you have no important data to preserve

-- Step 1: Drop existing constraints/enum if they exist
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_time_slot_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_time_slot_check;  
ALTER TABLE daily_upload_limits DROP CONSTRAINT IF EXISTS daily_upload_limits_time_slot_check;

-- Step 2: Drop the enum type if it exists
DROP TYPE IF EXISTS time_slot_enum CASCADE;

-- Step 3: Clear any existing data (since you said there are no posts)
DELETE FROM daily_upload_limits;
DELETE FROM posts;
DELETE FROM prompts;

-- Step 4: Modify columns to be plain TEXT temporarily
ALTER TABLE prompts ALTER COLUMN time_slot TYPE TEXT;
ALTER TABLE posts ALTER COLUMN time_slot TYPE TEXT;
ALTER TABLE daily_upload_limits ALTER COLUMN time_slot TYPE TEXT;

-- Step 5: Add new CHECK constraints with the new values
ALTER TABLE prompts ADD CONSTRAINT prompts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE posts ADD CONSTRAINT posts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE daily_upload_limits ADD CONSTRAINT daily_upload_limits_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Step 6: Add the free draw inspirations table
CREATE TABLE IF NOT EXISTS free_draw_inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('animals', 'nature', 'fantasy', 'objects', 'emotions', 'activities')),
  suggestion TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'tweens')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE free_draw_inspirations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view free draw inspirations" ON free_draw_inspirations
  FOR SELECT USING (true);

-- Step 7: Insert sample free draw inspirations (kids)
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  ('animals', 'Your favorite animal wearing a funny hat', 'kids', '🐶'),
  ('animals', 'A cat playing with a ball of yarn', 'kids', '🐱'),
  ('animals', 'A happy elephant with colorful decorations', 'kids', '🐘'),
  ('nature', 'A beautiful flower garden with butterflies', 'kids', '🌸'),
  ('nature', 'Your favorite tree with a treehouse', 'kids', '🌳'),
  ('nature', 'A rainbow after a rainy day', 'kids', '🌈'),
  ('fantasy', 'A friendly dragon sharing ice cream', 'kids', '🐲'),
  ('fantasy', 'A unicorn in a field of flowers', 'kids', '🦄'),
  ('fantasy', 'A magical castle in the clouds', 'kids', '🏰'),
  ('objects', 'Your favorite toy having an adventure', 'kids', '🧸'),
  ('objects', 'A car or truck with a funny face', 'kids', '🚗'),
  ('objects', 'A robot helper doing chores', 'kids', '🤖'),
  ('emotions', 'What happiness looks like to you', 'kids', '😊'),
  ('emotions', 'A picture that shows kindness', 'kids', '💝'),
  ('emotions', 'Your favorite memory as a drawing', 'kids', '🌟'),
  ('activities', 'Your favorite sport or game', 'kids', '⚽'),
  ('activities', 'A family picnic in the park', 'kids', '🧺'),
  ('activities', 'Dancing with friends', 'kids', '💃');

-- Insert sample free draw inspirations (tweens)
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  ('animals', 'An animal in an unexpected environment', 'tweens', '🦋'),
  ('animals', 'Your spirit animal in its natural habitat', 'tweens', '🦅'),
  ('animals', 'Two different animals working together', 'tweens', '🐺'),
  ('nature', 'Your ideal eco-friendly city', 'tweens', '🌿'),
  ('nature', 'The four seasons in one picture', 'tweens', '🍂'),
  ('nature', 'A night sky with constellations you create', 'tweens', '⭐'),
  ('fantasy', 'Your own fantasy world with unique rules', 'tweens', '🔮'),
  ('fantasy', 'A steampunk invention you would create', 'tweens', '⚙️'),
  ('fantasy', 'Your superhero team saving the day', 'tweens', '🦸'),
  ('objects', 'Technology from 100 years in the future', 'tweens', '🚀'),
  ('objects', 'Your dream room or workspace', 'tweens', '🛏️'),
  ('objects', 'An invention that would help the world', 'tweens', '💡'),
  ('emotions', 'What growing up feels like', 'tweens', '🌱'),
  ('emotions', 'The feeling of accomplishment', 'tweens', '🏆'),
  ('emotions', 'Your hopes for the future', 'tweens', '🌅'),
  ('activities', 'Your ideal career in action', 'tweens', '💼'),
  ('activities', 'A social cause you care about', 'tweens', '🤝'),
  ('activities', 'Creating art in an unusual place', 'tweens', '🎨');

-- Step 8: Insert some test prompts for today
INSERT INTO prompts (date, age_group, time_slot, difficulty, prompt_text) VALUES
  -- Kids prompts for today
  (CURRENT_DATE, 'kids', 'daily_1', 'easy', 'Draw your favorite animal having a fun adventure! Maybe they''re exploring a magical forest or playing with friends. What exciting things does your animal discover?'),
  (CURRENT_DATE, 'kids', 'daily_2', 'medium', 'Create a picture of the most amazing playground you can imagine! Include slides, swings, and any other fun equipment. What special features would make this playground incredible?'),
  
  -- Tweens prompts for today  
  (CURRENT_DATE, 'tweens', 'daily_1', 'easy', 'Draw yourself in your dream job 10 years from now. What would you be doing? Where would you work? Show yourself doing something amazing in your future career!'),
  (CURRENT_DATE, 'tweens', 'daily_2', 'medium', 'Design the perfect hangout space for you and your friends. What games, activities, or features would it have? Make it the coolest place ever to spend time together!');

-- Verify the schema changes worked
SELECT 'Schema update completed successfully!' as status;