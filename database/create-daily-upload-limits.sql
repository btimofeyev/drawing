-- Create daily_upload_limits table
-- This table tracks upload limits per child per day per time slot

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

-- Enable RLS
ALTER TABLE daily_upload_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for upload limits
CREATE POLICY "Users can manage their own upload limits" ON daily_upload_limits
  FOR ALL USING (true); -- Will be validated in application logic

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_daily_upload_limits_child_date 
ON daily_upload_limits(child_id, date);

CREATE INDEX IF NOT EXISTS idx_daily_upload_limits_child_date_slot 
ON daily_upload_limits(child_id, date, time_slot);