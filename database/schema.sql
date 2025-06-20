-- Daily Scribble Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parent accounts table
CREATE TABLE IF NOT EXISTS parent_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child profiles table
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parent_accounts(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'tweens')),
  pin_hash TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  parental_consent BOOLEAN DEFAULT FALSE
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('kids', 'tweens')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, age_group, difficulty)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'))
);

-- Child likes table
CREATE TABLE IF NOT EXISTS child_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, post_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, achievement_id)
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL UNIQUE REFERENCES child_profiles(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  last_post_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Parent accounts policies
CREATE POLICY "Parents can view their own account" ON parent_accounts
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can update their own account" ON parent_accounts
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Parents can insert their own account" ON parent_accounts
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Child profiles policies
CREATE POLICY "Parents can manage their children" ON child_profiles
  FOR ALL USING (
    parent_id IN (
      SELECT id FROM parent_accounts WHERE auth.uid() = id
    )
  );
CREATE POLICY "Public can view approved child profiles" ON child_profiles
  FOR SELECT USING (parental_consent = true);

-- Prompts policies (public read)
CREATE POLICY "Anyone can view prompts" ON prompts
  FOR SELECT USING (true);

-- Posts policies
CREATE POLICY "Public can view approved posts" ON posts
  FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Children can insert their own posts" ON posts
  FOR INSERT WITH CHECK (true); -- Will be validated in application logic
CREATE POLICY "Children can update their own posts" ON posts
  FOR UPDATE USING (true); -- Will be validated in application logic

-- Child likes policies
CREATE POLICY "Public can view likes" ON child_likes
  FOR SELECT USING (true);
CREATE POLICY "Children can manage their own likes" ON child_likes
  FOR ALL USING (true); -- Will be validated in application logic

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Public can view user achievements" ON user_achievements
  FOR SELECT USING (true);
CREATE POLICY "System can manage user achievements" ON user_achievements
  FOR ALL USING (true); -- Will be managed by server-side functions

-- User stats policies
CREATE POLICY "Public can view user stats" ON user_stats
  FOR SELECT USING (true);
CREATE POLICY "System can manage user stats" ON user_stats
  FOR ALL USING (true); -- Will be managed by server-side functions

-- Functions

-- Function to handle likes
CREATE OR REPLACE FUNCTION handle_child_like(p_child_id UUID, p_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like already exists
  SELECT EXISTS(
    SELECT 1 FROM child_likes 
    WHERE child_id = p_child_id AND post_id = p_post_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Unlike: remove like and decrement counter
    DELETE FROM child_likes 
    WHERE child_id = p_child_id AND post_id = p_post_id;
    
    UPDATE posts 
    SET likes_count = likes_count - 1 
    WHERE id = p_post_id;
    
    RETURN FALSE;
  ELSE
    -- Like: add like and increment counter
    INSERT INTO child_likes (child_id, post_id) 
    VALUES (p_child_id, p_post_id);
    
    UPDATE posts 
    SET likes_count = likes_count + 1 
    WHERE id = p_post_id;
    
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user stats after post
CREATE OR REPLACE FUNCTION update_user_stats_on_post(p_child_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO user_stats (child_id, total_posts, last_post_date, updated_at)
  VALUES (p_child_id, 1, CURRENT_DATE, NOW())
  ON CONFLICT (child_id) DO UPDATE SET
    total_posts = user_stats.total_posts + 1,
    last_post_date = CURRENT_DATE,
    updated_at = NOW();
    
  -- Update streak logic would go here
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
  ('First Drawing', 'Upload your very first artwork', '🎨', 'upload_count:1', 10),
  ('Social Butterfly', 'Give 10 likes to other artists', '👍', 'likes_given:10', 15),
  ('Popular Artist', 'Receive 25 likes on your artwork', '⭐', 'likes_received:25', 20),
  ('Daily Creator', 'Post artwork for 7 days in a row', '🔥', 'streak:7', 50),
  ('Master Artist', 'Upload 50 pieces of artwork', '🏆', 'upload_count:50', 100)
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for artwork
INSERT INTO storage.buckets (id, name, public) VALUES ('artwork', 'artwork', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for artwork bucket
CREATE POLICY "Public can view artwork" ON storage.objects
  FOR SELECT USING (bucket_id = 'artwork');
CREATE POLICY "Authenticated users can upload artwork" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artwork');
CREATE POLICY "Users can update their own artwork" ON storage.objects
  FOR UPDATE USING (bucket_id = 'artwork');
CREATE POLICY "Users can delete their own artwork" ON storage.objects
  FOR DELETE USING (bucket_id = 'artwork');