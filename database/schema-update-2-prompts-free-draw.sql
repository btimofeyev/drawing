-- Database schema update to support 2 daily prompts + 1 free draw
-- Run this migration after the main schema

-- Update the time_slot constraint to support the new structure
-- We'll use: 'daily_1', 'daily_2', 'free_draw'
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_time_slot_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Update the posts table time_slot constraint 
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_time_slot_check;
ALTER TABLE posts ADD CONSTRAINT posts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Update the daily_upload_limits table time_slot constraint
ALTER TABLE daily_upload_limits DROP CONSTRAINT IF EXISTS daily_upload_limits_time_slot_check;
ALTER TABLE daily_upload_limits ADD CONSTRAINT daily_upload_limits_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Update the unique constraint on prompts to work with new time slots
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_date_age_group_time_slot_key;
ALTER TABLE prompts ADD CONSTRAINT prompts_date_age_group_time_slot_key 
UNIQUE(date, age_group, time_slot);

-- Add a new table for free draw inspirations
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

-- Create policy for public read access to inspirations
CREATE POLICY "Anyone can view free draw inspirations" ON free_draw_inspirations
  FOR SELECT USING (true);

-- Insert some default free draw inspirations for kids
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  -- Animals
  ('animals', 'Your favorite animal wearing a funny hat', 'kids', '🐶'),
  ('animals', 'A cat playing with a ball of yarn', 'kids', '🐱'),
  ('animals', 'A happy elephant with colorful decorations', 'kids', '🐘'),
  ('animals', 'Your dream pet doing something silly', 'kids', '🐾'),
  ('animals', 'Two animals who are best friends', 'kids', '🦎'),
  
  -- Nature
  ('nature', 'A beautiful flower garden with butterflies', 'kids', '🌸'),
  ('nature', 'Your favorite tree with a treehouse', 'kids', '🌳'),
  ('nature', 'A rainbow after a rainy day', 'kids', '🌈'),
  ('nature', 'The sun and clouds having a conversation', 'kids', '☀️'),
  ('nature', 'A magical garden with talking plants', 'kids', '🌺'),
  
  -- Fantasy
  ('fantasy', 'A friendly dragon sharing ice cream', 'kids', '🐲'),
  ('fantasy', 'A unicorn in a field of flowers', 'kids', '🦄'),
  ('fantasy', 'A magical castle in the clouds', 'kids', '🏰'),
  ('fantasy', 'A fairy house made from a mushroom', 'kids', '🧚'),
  ('fantasy', 'Your own superhero character', 'kids', '⭐'),
  
  -- Objects
  ('objects', 'Your favorite toy having an adventure', 'kids', '🧸'),
  ('objects', 'A car or truck with a funny face', 'kids', '🚗'),
  ('objects', 'Your dream playground', 'kids', '🛝'),
  ('objects', 'A robot helper doing chores', 'kids', '🤖'),
  ('objects', 'A magical paintbrush that brings drawings to life', 'kids', '🖌️'),
  
  -- Emotions
  ('emotions', 'What happiness looks like to you', 'kids', '😊'),
  ('emotions', 'A picture that shows kindness', 'kids', '💝'),
  ('emotions', 'Your favorite memory as a drawing', 'kids', '🌟'),
  ('emotions', 'What makes you feel brave', 'kids', '💪'),
  ('emotions', 'A hug drawn as shapes and colors', 'kids', '🤗'),
  
  -- Activities
  ('activities', 'Your favorite sport or game', 'kids', '⚽'),
  ('activities', 'A family picnic in the park', 'kids', '🧺'),
  ('activities', 'Dancing with friends', 'kids', '💃'),
  ('activities', 'Building something amazing with blocks', 'kids', '🧱'),
  ('activities', 'Your ideal birthday party', 'kids', '🎉');

-- Insert some default free draw inspirations for tweens
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  -- Animals
  ('animals', 'An animal in an unexpected environment', 'tweens', '🦋'),
  ('animals', 'Your spirit animal in its natural habitat', 'tweens', '🦅'),
  ('animals', 'Two different animals working together', 'tweens', '🐺'),
  ('animals', 'An endangered species you want to protect', 'tweens', '🐼'),
  ('animals', 'Animals from different continents meeting', 'tweens', '🌍'),
  
  -- Nature
  ('nature', 'A landscape that shows climate change', 'tweens', '🌡️'),
  ('nature', 'Your ideal eco-friendly city', 'tweens', '🌿'),
  ('nature', 'The four seasons in one picture', 'tweens', '🍂'),
  ('nature', 'An underwater scene with marine life', 'tweens', '🐠'),
  ('nature', 'A night sky with constellations you create', 'tweens', '⭐'),
  
  -- Fantasy
  ('fantasy', 'Your own fantasy world with unique rules', 'tweens', '🔮'),
  ('fantasy', 'A steampunk invention you would create', 'tweens', '⚙️'),
  ('fantasy', 'Characters from different mythologies meeting', 'tweens', '🗿'),
  ('fantasy', 'A portal to another dimension', 'tweens', '🌀'),
  ('fantasy', 'Your superhero team saving the day', 'tweens', '🦸'),
  
  -- Objects
  ('objects', 'Technology from 100 years in the future', 'tweens', '🚀'),
  ('objects', 'Your dream room or workspace', 'tweens', '🛏️'),
  ('objects', 'An invention that would help the world', 'tweens', '💡'),
  ('objects', 'Your ideal transportation method', 'tweens', '🛸'),
  ('objects', 'A time machine and what era you would visit', 'tweens', '⏰'),
  
  -- Emotions
  ('emotions', 'What growing up feels like', 'tweens', '🌱'),
  ('emotions', 'Anxiety represented through abstract art', 'tweens', '🌪️'),
  ('emotions', 'The feeling of accomplishment', 'tweens', '🏆'),
  ('emotions', 'What friendship means to you', 'tweens', '👫'),
  ('emotions', 'Your hopes for the future', 'tweens', '🌅'),
  
  -- Activities
  ('activities', 'Your ideal career in action', 'tweens', '💼'),
  ('activities', 'A social cause you care about', 'tweens', '🤝'),
  ('activities', 'Your perfect day from start to finish', 'tweens', '📅'),
  ('activities', 'Learning something new and challenging', 'tweens', '📚'),
  ('activities', 'Creating art in an unusual place', 'tweens', '🎨');

-- Function to get random free draw inspiration
CREATE OR REPLACE FUNCTION get_random_free_draw_inspiration(p_age_group TEXT)
RETURNS TABLE(suggestion TEXT, emoji TEXT, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fdi.suggestion, 
    fdi.emoji, 
    fdi.category
  FROM free_draw_inspirations fdi
  WHERE fdi.age_group = p_age_group
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing data to use new time slot structure
-- This is a data migration - you may want to backup data first
-- For now, we'll just comment this out and handle it separately

-- Update prompts: morning -> daily_1, afternoon -> daily_2, evening can be removed or converted to daily_2
-- UPDATE prompts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
-- UPDATE prompts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
-- DELETE FROM prompts WHERE time_slot = 'evening'; -- or UPDATE to daily_2

-- Update posts: same logic
-- UPDATE posts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
-- UPDATE posts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
-- UPDATE posts SET time_slot = 'free_draw' WHERE time_slot = 'evening'; -- or handle differently

-- Update daily_upload_limits: same logic
-- UPDATE daily_upload_limits SET time_slot = 'daily_1' WHERE time_slot = 'morning';
-- UPDATE daily_upload_limits SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
-- UPDATE daily_upload_limits SET time_slot = 'free_draw' WHERE time_slot = 'evening';