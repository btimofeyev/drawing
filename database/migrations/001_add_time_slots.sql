-- Migration: Add Time Slots for 3 Daily Prompts System
-- This enables 3 prompts per day (morning, afternoon, evening) with upload limits

-- Create time slot enum
CREATE TYPE time_slot AS ENUM ('morning', 'afternoon', 'evening');

-- Add time_slot column to prompts table
ALTER TABLE prompts ADD COLUMN time_slot time_slot NOT NULL DEFAULT 'morning';

-- Update the unique constraint to allow multiple prompts per day
-- Remove the old constraint if it exists
DROP INDEX IF EXISTS idx_prompts_unique_daily;
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_date_age_group_key;

-- Add new unique constraint for date, age_group, and time_slot
ALTER TABLE prompts ADD CONSTRAINT prompts_date_age_group_time_slot_key 
  UNIQUE (date, age_group, time_slot);

-- Add time_slot column to posts table
ALTER TABLE posts ADD COLUMN time_slot time_slot;
ALTER TABLE posts ADD COLUMN prompt_id uuid REFERENCES prompts(id);

-- Create daily_upload_limits table to track uploads per slot
CREATE TABLE daily_upload_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot time_slot NOT NULL,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  uploaded_at timestamp with time zone DEFAULT now(),
  
  -- Ensure one upload per child per slot per day
  CONSTRAINT daily_upload_limits_unique UNIQUE (child_id, date, time_slot)
);

-- Add indexes for performance
CREATE INDEX idx_daily_upload_limits_child_date ON daily_upload_limits(child_id, date);
CREATE INDEX idx_daily_upload_limits_date_slot ON daily_upload_limits(date, time_slot);
CREATE INDEX idx_posts_time_slot ON posts(time_slot);
CREATE INDEX idx_posts_prompt_id ON posts(prompt_id);
CREATE INDEX idx_prompts_date_slot ON prompts(date, time_slot);

-- Function to get current time slot based on time
CREATE OR REPLACE FUNCTION get_current_time_slot()
RETURNS time_slot AS $$
DECLARE
  current_hour int;
BEGIN
  current_hour := EXTRACT(hour FROM now() AT TIME ZONE 'UTC');
  
  -- Morning: 6 AM - 12 PM (6-11)
  IF current_hour >= 6 AND current_hour < 12 THEN
    RETURN 'morning'::time_slot;
  -- Afternoon: 12 PM - 6 PM (12-17)  
  ELSIF current_hour >= 12 AND current_hour < 18 THEN
    RETURN 'afternoon'::time_slot;
  -- Evening: 6 PM - 10 PM (18-21) and late night/early morning (22-5)
  ELSE
    RETURN 'evening'::time_slot;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if child can upload to a specific time slot
CREATE OR REPLACE FUNCTION can_upload_to_slot(
  p_child_id uuid,
  p_date date,
  p_time_slot time_slot
)
RETURNS boolean AS $$
BEGIN
  -- Check if child has already uploaded to this slot today
  RETURN NOT EXISTS (
    SELECT 1 FROM daily_upload_limits
    WHERE child_id = p_child_id
    AND date = p_date
    AND time_slot = p_time_slot
  );
END;
$$ LANGUAGE plpgsql;

-- Function to record upload to slot
CREATE OR REPLACE FUNCTION record_upload_to_slot(
  p_child_id uuid,
  p_post_id uuid,
  p_date date,
  p_time_slot time_slot
)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_upload_limits (child_id, post_id, date, time_slot)
  VALUES (p_child_id, p_post_id, p_date, p_time_slot);
END;
$$ LANGUAGE plpgsql;

-- Update existing prompts to have time slots (default to morning)
-- In production, you might want to create afternoon/evening variants
UPDATE prompts SET time_slot = 'morning' WHERE time_slot IS NULL;

-- Add some comments for clarity
COMMENT ON COLUMN prompts.time_slot IS 'Time slot for the prompt: morning (6-12), afternoon (12-18), evening (18-6)';
COMMENT ON COLUMN posts.time_slot IS 'Time slot when this post was created';
COMMENT ON COLUMN posts.prompt_id IS 'Reference to the specific prompt this post responds to';
COMMENT ON TABLE daily_upload_limits IS 'Tracks daily upload limits per child per time slot';

-- Create view for easy querying of daily prompts with slots
CREATE OR REPLACE VIEW daily_prompts_with_slots AS
SELECT 
  p.*,
  CASE 
    WHEN p.time_slot = 'morning' THEN 1
    WHEN p.time_slot = 'afternoon' THEN 2
    WHEN p.time_slot = 'evening' THEN 3
  END as slot_order
FROM prompts p
ORDER BY p.date DESC, slot_order;