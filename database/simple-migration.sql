-- Simple migration for time slot changes
-- Run this step by step in your Supabase SQL Editor

-- Step 1: Update existing data first (before changing constraints)
-- Update prompts
UPDATE prompts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE prompts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon'; 
DELETE FROM prompts WHERE time_slot = 'evening';

-- Update posts  
UPDATE posts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE posts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
UPDATE posts SET time_slot = 'free_draw' WHERE time_slot = 'evening';

-- Update daily_upload_limits
UPDATE daily_upload_limits SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE daily_upload_limits SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
DELETE FROM daily_upload_limits WHERE time_slot = 'evening';

-- Step 2: Now update the constraints
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_time_slot_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_time_slot_check;
ALTER TABLE posts ADD CONSTRAINT posts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

ALTER TABLE daily_upload_limits DROP CONSTRAINT IF EXISTS daily_upload_limits_time_slot_check;
ALTER TABLE daily_upload_limits ADD CONSTRAINT daily_upload_limits_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Step 3: Add the free draw inspirations table and data
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

-- Insert sample data (kids)
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

-- Insert sample data (tweens)  
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