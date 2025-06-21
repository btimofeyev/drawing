-- Migration: Add Preschooler Age Group Support
-- This migration adds support for preschoolers (ages 4-6) to the existing Daily Scribble database
-- 
-- IMPORTANT: Run this migration in the following order:
-- 1. Drop existing CHECK constraints
-- 2. Add new CHECK constraints with three age groups
-- 3. Verify the migration was successful
--
-- Age Group Structure:
-- - preschoolers: Ages 4-6 (new)
-- - kids: Ages 7-10 (updated from 6-10)
-- - tweens: Ages 11-16 (unchanged)

BEGIN;

-- Step 1: Update child_profiles table to support three age groups
-- First, drop the existing CHECK constraint
ALTER TABLE child_profiles DROP CONSTRAINT IF EXISTS child_profiles_age_group_check;

-- Add new CHECK constraint with three age groups
ALTER TABLE child_profiles ADD CONSTRAINT child_profiles_age_group_check 
CHECK (age_group IN ('preschoolers', 'kids', 'tweens'));

-- Step 2: Update prompts table to support three age groups
-- First, drop the existing CHECK constraint
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_age_group_check;

-- Add new CHECK constraint with three age groups
ALTER TABLE prompts ADD CONSTRAINT prompts_age_group_check 
CHECK (age_group IN ('preschoolers', 'kids', 'tweens'));

-- Step 3: Add preschooler-specific sample prompts for immediate functionality
-- These are very simple, age-appropriate prompts for 4-6 year olds
INSERT INTO prompts (date, age_group, difficulty, prompt_text, time_slot) VALUES
-- Daily Challenge 1 prompts for preschoolers
(CURRENT_DATE, 'preschoolers', 'easy', 'Draw a big happy sun with a smiley face! ☀️', 'daily_1'),
(CURRENT_DATE + INTERVAL '1 day', 'preschoolers', 'easy', 'Draw your favorite animal. Make it colorful! 🐱', 'daily_1'),
(CURRENT_DATE + INTERVAL '2 days', 'preschoolers', 'easy', 'Draw a house with windows and a door 🏠', 'daily_1'),
(CURRENT_DATE + INTERVAL '3 days', 'preschoolers', 'easy', 'Draw a flower with lots of petals 🌸', 'daily_1'),
(CURRENT_DATE + INTERVAL '4 days', 'preschoolers', 'easy', 'Draw a car or truck. Add big wheels! 🚗', 'daily_1'),

-- Daily Challenge 2 prompts for preschoolers  
(CURRENT_DATE, 'preschoolers', 'easy', 'Draw your family. Use stick figures! 👨‍👩‍👧‍👦', 'daily_2'),
(CURRENT_DATE + INTERVAL '1 day', 'preschoolers', 'easy', 'Draw a tree with lots of leaves 🌳', 'daily_2'),
(CURRENT_DATE + INTERVAL '2 days', 'preschoolers', 'easy', 'Draw a rainbow with all the colors! 🌈', 'daily_2'),
(CURRENT_DATE + INTERVAL '3 days', 'preschoolers', 'easy', 'Draw a big circle and make it into something fun! ⭕', 'daily_2'),
(CURRENT_DATE + INTERVAL '4 days', 'preschoolers', 'easy', 'Draw your favorite food. Make it yummy looking! 🍎', 'daily_2')

ON CONFLICT (date, age_group, difficulty) DO NOTHING;

-- Step 4: Add preschooler-specific free draw inspirations
INSERT INTO free_draw_inspirations (category, suggestion, age_group) VALUES
-- Animals category for preschoolers
('animals', 'A cat taking a nap', 'preschoolers'),
('animals', 'A dog wagging its tail', 'preschoolers'),
('animals', 'A fish swimming in a bowl', 'preschoolers'),
('animals', 'A bird singing in a tree', 'preschoolers'),
('animals', 'A bunny hopping in grass', 'preschoolers'),

-- Nature category for preschoolers
('nature', 'A big yellow sun', 'preschoolers'),
('nature', 'Fluffy white clouds', 'preschoolers'),
('nature', 'A flower in a garden', 'preschoolers'),
('nature', 'A tall green tree', 'preschoolers'),
('nature', 'Rain falling from clouds', 'preschoolers'),

-- Objects category for preschoolers
('objects', 'A red ball', 'preschoolers'),
('objects', 'A colorful balloon', 'preschoolers'),
('objects', 'A toy car', 'preschoolers'),
('objects', 'A teddy bear', 'preschoolers'),
('objects', 'A birthday cake', 'preschoolers'),

-- Fantasy category for preschoolers
('fantasy', 'A friendly monster with big eyes', 'preschoolers'),
('fantasy', 'A magic wand with stars', 'preschoolers'),
('fantasy', 'A flying superhero', 'preschoolers'),
('fantasy', 'A castle in the clouds', 'preschoolers'),
('fantasy', 'A dragon that breathes rainbows', 'preschoolers'),

-- Emotions category for preschoolers  
('emotions', 'A happy face with a big smile', 'preschoolers'),
('emotions', 'Someone giving a hug', 'preschoolers'),
('emotions', 'A surprised face with wide eyes', 'preschoolers'),
('emotions', 'Someone laughing and having fun', 'preschoolers'),
('emotions', 'A kind person helping others', 'preschoolers'),

-- Activities category for preschoolers
('activities', 'Playing on a playground', 'preschoolers'),
('activities', 'Having a picnic outside', 'preschoolers'),
('activities', 'Reading a favorite book', 'preschoolers'),
('activities', 'Playing with blocks', 'preschoolers'),
('activities', 'Dancing to music', 'preschoolers')

ON CONFLICT (category, suggestion, age_group) DO NOTHING;

-- Step 5: Create helpful view for age group statistics
CREATE OR REPLACE VIEW age_group_stats AS
SELECT 
  age_group,
  COUNT(*) as total_children,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_children_30_days
FROM child_profiles 
WHERE parental_consent = true 
GROUP BY age_group;

COMMIT;

-- Verification queries to run after migration:
-- 1. Check that constraints were updated:
-- SELECT con.conname, con.consrc FROM pg_constraint con 
-- JOIN pg_class rel ON rel.oid = con.conrelid 
-- WHERE rel.relname IN ('child_profiles', 'prompts') AND con.conname LIKE '%age_group%';

-- 2. Verify sample data was inserted:
-- SELECT age_group, COUNT(*) FROM prompts WHERE age_group = 'preschoolers' GROUP BY age_group;
-- SELECT age_group, COUNT(*) FROM free_draw_inspirations WHERE age_group = 'preschoolers' GROUP BY age_group;

-- 3. Test the new age group view:
-- SELECT * FROM age_group_stats;