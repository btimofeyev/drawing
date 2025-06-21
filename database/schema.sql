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
  age_group TEXT NOT NULL CHECK (age_group IN ('preschoolers', 'kids', 'tweens')),
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
  age_group TEXT NOT NULL CHECK (age_group IN ('preschoolers', 'kids', 'tweens')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prompt_text TEXT NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw')),
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
  time_slot TEXT CHECK (time_slot IN ('daily_1', 'daily_2', 'free_draw')),
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

-- Daily upload limits table
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

-- Free draw inspirations table
CREATE TABLE IF NOT EXISTS free_draw_inspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('animals', 'nature', 'fantasy', 'objects', 'emotions', 'activities')),
  suggestion TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('preschoolers', 'kids', 'tweens')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
ALTER TABLE daily_upload_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_draw_inspirations ENABLE ROW LEVEL SECURITY;

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

-- Daily upload limits policies
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

-- Free draw inspirations policies (public read)
CREATE POLICY "Anyone can view free draw inspirations" ON free_draw_inspirations
  FOR SELECT USING (true);

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