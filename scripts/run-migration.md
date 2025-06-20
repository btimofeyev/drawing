# Database Migration Instructions

## Run this SQL in your Supabase SQL Editor

Copy and paste the following SQL into your Supabase project's SQL Editor:

```sql
-- Add views tracking to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Function to update user stats when they give a like
CREATE OR REPLACE FUNCTION update_user_stats_on_like(p_child_id UUID, p_liked BOOLEAN)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user stats for the child giving the like
  INSERT INTO user_stats (child_id, total_likes_given, updated_at)
  VALUES (p_child_id, 1, NOW())
  ON CONFLICT (child_id) DO UPDATE SET
    total_likes_given = CASE 
      WHEN p_liked THEN user_stats.total_likes_given + 1
      ELSE GREATEST(user_stats.total_likes_given - 1, 0)
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats when they receive a like
CREATE OR REPLACE FUNCTION update_user_stats_on_like_received(p_child_id UUID, p_liked BOOLEAN)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user stats for the child receiving the like
  INSERT INTO user_stats (child_id, total_likes_received, updated_at)
  VALUES (p_child_id, 1, NOW())
  ON CONFLICT (child_id) DO UPDATE SET
    total_likes_received = CASE 
      WHEN p_liked THEN user_stats.total_likes_received + 1
      ELSE GREATEST(user_stats.total_likes_received - 1, 0)
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID, p_child_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Increment view count
  UPDATE posts 
  SET views_count = views_count + 1 
  WHERE id = p_post_id;
  
  -- Optionally track who viewed (could add view history table later)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to update user stats after post with streak calculation
CREATE OR REPLACE FUNCTION update_user_stats_on_post(p_child_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_post_date DATE;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Get current stats
  SELECT last_post_date, current_streak, best_streak
  INTO v_last_post_date, v_current_streak, v_best_streak
  FROM user_stats
  WHERE child_id = p_child_id;
  
  -- Calculate new streak
  IF v_last_post_date IS NULL THEN
    -- First post ever
    v_new_streak := 1;
  ELSIF v_last_post_date = CURRENT_DATE THEN
    -- Already posted today, no streak change
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSIF v_last_post_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Posted yesterday, continue streak
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Gap in posting, reset streak
    v_new_streak := 1;
  END IF;
  
  -- Insert or update user stats
  INSERT INTO user_stats (
    child_id, 
    total_posts, 
    current_streak,
    best_streak,
    last_post_date, 
    updated_at
  )
  VALUES (
    p_child_id, 
    1, 
    v_new_streak,
    GREATEST(v_new_streak, COALESCE(v_best_streak, 0)),
    CURRENT_DATE, 
    NOW()
  )
  ON CONFLICT (child_id) DO UPDATE SET
    total_posts = user_stats.total_posts + 1,
    current_streak = v_new_streak,
    best_streak = GREATEST(v_new_streak, user_stats.best_streak),
    last_post_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

After running this migration, the likes, views, and streaks functionality will be fully operational!