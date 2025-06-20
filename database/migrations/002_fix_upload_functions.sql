-- Migration: Fix missing upload functions and improve upload system
-- This adds the missing functions that the API is trying to call

-- Function to check if child can upload to a specific time slot (matches API call)
CREATE OR REPLACE FUNCTION can_child_upload_to_slot(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment upload count (matches API call)
CREATE OR REPLACE FUNCTION increment_upload_count(
  p_child_id uuid,
  p_date date,
  p_time_slot time_slot
)
RETURNS void AS $$
DECLARE
  latest_post_id uuid;
BEGIN
  -- Get the most recent post by this child for this slot today
  SELECT id INTO latest_post_id
  FROM posts 
  WHERE child_id = p_child_id 
    AND time_slot = p_time_slot
    AND DATE(created_at) = p_date
  ORDER BY created_at DESC 
  LIMIT 1;

  -- If we found a post, record the upload limit
  IF latest_post_id IS NOT NULL THEN
    INSERT INTO daily_upload_limits (child_id, post_id, date, time_slot)
    VALUES (p_child_id, latest_post_id, p_date, p_time_slot)
    ON CONFLICT (child_id, date, time_slot) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the existing record_upload_to_slot function
CREATE OR REPLACE FUNCTION record_upload_to_slot(
  p_child_id uuid,
  p_post_id uuid,
  p_date date,
  p_time_slot time_slot
)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_upload_limits (child_id, post_id, date, time_slot)
  VALUES (p_child_id, p_post_id, p_date, p_time_slot)
  ON CONFLICT (child_id, date, time_slot) DO UPDATE SET
    post_id = EXCLUDED.post_id,
    uploaded_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upload summary for a child on a specific date
CREATE OR REPLACE FUNCTION get_child_upload_status(
  p_child_id uuid,
  p_date date
)
RETURNS TABLE (
  time_slot time_slot,
  can_upload boolean,
  has_uploaded boolean,
  post_id uuid,
  uploaded_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH slots AS (
    SELECT unnest(ARRAY['morning'::time_slot, 'afternoon'::time_slot, 'evening'::time_slot]) as slot
  ),
  uploads AS (
    SELECT 
      dul.time_slot,
      dul.post_id,
      dul.uploaded_at
    FROM daily_upload_limits dul
    WHERE dul.child_id = p_child_id AND dul.date = p_date
  )
  SELECT 
    slots.slot as time_slot,
    (uploads.time_slot IS NULL) as can_upload,
    (uploads.time_slot IS NOT NULL) as has_uploaded,
    uploads.post_id,
    uploads.uploaded_at
  FROM slots
  LEFT JOIN uploads ON slots.slot = uploads.time_slot
  ORDER BY 
    CASE slots.slot 
      WHEN 'morning' THEN 1 
      WHEN 'afternoon' THEN 2 
      WHEN 'evening' THEN 3 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for clarity
COMMENT ON FUNCTION can_child_upload_to_slot IS 'Check if a child can upload to a specific time slot on a given date';
COMMENT ON FUNCTION increment_upload_count IS 'Record that a child has uploaded to a time slot (called after post creation)';
COMMENT ON FUNCTION record_upload_to_slot IS 'Explicitly record an upload to a time slot with post reference';
COMMENT ON FUNCTION get_child_upload_status IS 'Get comprehensive upload status for all time slots for a child on a date';