-- Migration to update time_slot enum values
-- Run this BEFORE the main schema update

-- First, we need to add the new enum values to the existing enum type
-- PostgreSQL doesn't allow dropping enum values that are in use, so we'll:
-- 1. Add new values to the enum
-- 2. Update existing data
-- 3. Remove old enum values

-- Step 1: Add new enum values
ALTER TYPE time_slot_enum ADD VALUE IF NOT EXISTS 'daily_1';
ALTER TYPE time_slot_enum ADD VALUE IF NOT EXISTS 'daily_2'; 
ALTER TYPE time_slot_enum ADD VALUE IF NOT EXISTS 'free_draw';

-- If the enum doesn't exist, we need to create it first
-- Check if we're working with CHECK constraints instead of ENUMs

-- Step 2: Update existing data
-- Convert morning -> daily_1, afternoon -> daily_2, evening -> free_draw (or remove evening)

-- Update prompts table
UPDATE prompts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE prompts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
-- For evening prompts, we'll delete them since we only want 2 daily prompts
DELETE FROM prompts WHERE time_slot = 'evening';

-- Update posts table  
UPDATE posts SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE posts SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
UPDATE posts SET time_slot = 'free_draw' WHERE time_slot = 'evening';

-- Update daily_upload_limits table
UPDATE daily_upload_limits SET time_slot = 'daily_1' WHERE time_slot = 'morning';
UPDATE daily_upload_limits SET time_slot = 'daily_2' WHERE time_slot = 'afternoon';
-- For evening upload limits, convert to free_draw or delete
DELETE FROM daily_upload_limits WHERE time_slot = 'evening';

-- Step 3: Now we can drop the old CHECK constraints and add new ones
-- (This is needed if using CHECK constraints instead of ENUMs)

-- For prompts table
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_time_slot_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- For posts table  
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_time_slot_check;
ALTER TABLE posts ADD CONSTRAINT posts_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));

-- For daily_upload_limits table
ALTER TABLE daily_upload_limits DROP CONSTRAINT IF EXISTS daily_upload_limits_time_slot_check;
ALTER TABLE daily_upload_limits ADD CONSTRAINT daily_upload_limits_time_slot_check 
CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw'));