-- Migration: Add time slots and missing tables
-- Run this script on existing databases to sync with updated schema
-- Date: 2025-06-20

-- Add time_slot column to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS time_slot TEXT CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Add time_slot column to posts table  
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS time_slot TEXT CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- Create daily_upload_limits table
CREATE TABLE IF NOT EXISTS daily_upload_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw')),
  uploads_count INTEGER DEFAULT 0,
  last_upload_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, date, time_slot)
);

-- Create free_draw_inspirations table
CREATE TABLE IF NOT EXISTS free_draw_inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('animals', 'nature', 'fantasy', 'objects', 'emotions', 'activities')),
  suggestion TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'tweens')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE daily_upload_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_draw_inspirations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for daily_upload_limits
CREATE POLICY "System can manage upload limits" ON daily_upload_limits
  FOR ALL USING (true); -- Will be managed by server-side functions

CREATE POLICY "Parents can view their children's limits" ON daily_upload_limits
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id IN (
        SELECT id FROM parent_accounts WHERE auth.uid() = id
      )
    )
  );

-- Add RLS policies for free_draw_inspirations (public read)
CREATE POLICY "Anyone can view free draw inspirations" ON free_draw_inspirations
  FOR SELECT USING (true);

-- Insert free draw inspiration suggestions
INSERT INTO free_draw_inspirations (category, suggestion, age_group, emoji) VALUES
  -- Animals for kids
  ('animals', 'A friendly dog playing in the park', 'kids', '🐕'),
  ('animals', 'A colorful butterfly on a flower', 'kids', '🦋'),
  ('animals', 'A cute cat sleeping in the sun', 'kids', '🐱'),
  ('animals', 'A happy elephant splashing in water', 'kids', '🐘'),
  ('animals', 'A silly monkey swinging on vines', 'kids', '🐵'),
  
  -- Animals for tweens
  ('animals', 'A majestic wolf howling at the moon', 'tweens', '🐺'),
  ('animals', 'An underwater scene with dolphins', 'tweens', '🐬'),
  ('animals', 'A fierce tiger prowling through jungle', 'tweens', '🐅'),
  ('animals', 'An eagle soaring over mountains', 'tweens', '🦅'),
  ('animals', 'A family of penguins on ice', 'tweens', '🐧'),
  
  -- Nature for kids
  ('nature', 'A rainbow after the rain', 'kids', '🌈'),
  ('nature', 'Pretty flowers in a garden', 'kids', '🌸'),
  ('nature', 'A big tree with lots of leaves', 'kids', '🌳'),
  ('nature', 'The sun setting behind clouds', 'kids', '🌅'),
  ('nature', 'Snowflakes falling from the sky', 'kids', '❄️'),
  
  -- Nature for tweens
  ('nature', 'A dramatic storm over the ocean', 'tweens', '⛈️'),
  ('nature', 'Ancient forest with mysterious fog', 'tweens', '🌲'),
  ('nature', 'Desert landscape with cacti', 'tweens', '🌵'),
  ('nature', 'Mountain peak covered in snow', 'tweens', '🏔️'),
  ('nature', 'Waterfall cascading into a pool', 'tweens', '💧'),
  
  -- Fantasy for kids
  ('fantasy', 'A friendly dragon with colorful wings', 'kids', '🐲'),
  ('fantasy', 'A magical castle in the clouds', 'kids', '🏰'),
  ('fantasy', 'A unicorn in an enchanted forest', 'kids', '🦄'),
  ('fantasy', 'A fairy flying with sparkles', 'kids', '🧚'),
  ('fantasy', 'A treasure chest full of gems', 'kids', '💎'),
  
  -- Fantasy for tweens
  ('fantasy', 'A powerful wizard casting spells', 'tweens', '🧙'),
  ('fantasy', 'An epic battle between knights', 'tweens', '⚔️'),
  ('fantasy', 'A mythical phoenix rising from flames', 'tweens', '🔥'),
  ('fantasy', 'An underwater mermaid kingdom', 'tweens', '🧜'),
  ('fantasy', 'A mysterious portal to another world', 'tweens', '🌀'),
  
  -- Objects for kids
  ('objects', 'Your favorite toy come to life', 'kids', '🧸'),
  ('objects', 'A colorful birthday cake', 'kids', '🎂'),
  ('objects', 'A rocket ship going to space', 'kids', '🚀'),
  ('objects', 'A magical music box', 'kids', '🎵'),
  ('objects', 'A cozy house with a garden', 'kids', '🏡'),
  
  -- Objects for tweens
  ('objects', 'A vintage camera capturing memories', 'tweens', '📷'),
  ('objects', 'An old sailing ship on rough seas', 'tweens', '⛵'),
  ('objects', 'A steampunk mechanical invention', 'tweens', '⚙️'),
  ('objects', 'A mysterious locked door', 'tweens', '🗝️'),
  ('objects', 'An astronaut exploring alien planet', 'tweens', '👨‍🚀'),
  
  -- Emotions for kids
  ('emotions', 'What happiness looks like to you', 'kids', '😊'),
  ('emotions', 'Draw your biggest dream', 'kids', '💭'),
  ('emotions', 'A hug between best friends', 'kids', '🤗'),
  ('emotions', 'The feeling of a sunny day', 'kids', '☀️'),
  ('emotions', 'What makes you feel brave', 'kids', '💪'),
  
  -- Emotions for tweens
  ('emotions', 'The complexity of growing up', 'tweens', '🌱'),
  ('emotions', 'What courage means to you', 'tweens', '🦁'),
  ('emotions', 'The feeling of accomplishment', 'tweens', '🏆'),
  ('emotions', 'Express your inner strength', 'tweens', '💎'),
  ('emotions', 'The beauty of friendship', 'tweens', '🤝'),
  
  -- Activities for kids
  ('activities', 'Playing on the playground', 'kids', '🛝'),
  ('activities', 'Having a picnic with family', 'kids', '🧺'),
  ('activities', 'Dancing to your favorite song', 'kids', '💃'),
  ('activities', 'Building something with blocks', 'kids', '🧱'),
  ('activities', 'Reading a magical story', 'kids', '📚'),
  
  -- Activities for tweens
  ('activities', 'Skateboarding through the city', 'tweens', '🛹'),
  ('activities', 'Playing music with friends', 'tweens', '🎸'),
  ('activities', 'Cooking your favorite meal', 'tweens', '👨‍🍳'),
  ('activities', 'Exploring an abandoned building', 'tweens', '🏚️'),
  ('activities', 'Creating art in your studio', 'tweens', '🎨')
ON CONFLICT DO NOTHING;

-- Update existing prompts to have time_slot values based on difficulty
-- This is a one-time data migration for existing data
UPDATE prompts 
SET time_slot = CASE 
  WHEN difficulty = 'easy' THEN 'daily_1'
  WHEN difficulty = 'medium' THEN 'daily_2' 
  WHEN difficulty = 'hard' THEN 'free_draw'
  ELSE 'daily_1'
END
WHERE time_slot IS NULL;

-- Make time_slot NOT NULL after migrating data
ALTER TABLE prompts ALTER COLUMN time_slot SET NOT NULL;

-- Note: Posts time_slot will be populated by application logic going forward
-- Existing posts can remain with NULL time_slot for historical data