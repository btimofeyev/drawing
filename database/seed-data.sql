-- Sample prompts for testing
INSERT INTO prompts (date, age_group, difficulty, prompt_text) VALUES
  (CURRENT_DATE, 'kids', 'easy', 'Draw your favorite animal wearing a superhero cape!'),
  (CURRENT_DATE, 'tweens', 'easy', 'Create a magical creature that lives in your backyard'),
  (CURRENT_DATE - INTERVAL '1 day', 'kids', 'medium', 'Design a new kind of vehicle that can fly and swim'),
  (CURRENT_DATE - INTERVAL '1 day', 'tweens', 'medium', 'Illustrate your dream room with all your favorite things'),
  (CURRENT_DATE - INTERVAL '2 days', 'kids', 'hard', 'Draw a scene from your favorite book but in a different time period'),
  (CURRENT_DATE - INTERVAL '2 days', 'tweens', 'hard', 'Create a comic strip about a day in the life of your pet (real or imaginary)')
ON CONFLICT (date, age_group, difficulty) DO NOTHING;

-- Sample achievements (these should already exist from schema.sql but let's make sure)
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
  ('First Drawing', 'Upload your very first artwork', '🎨', 'upload_count:1', 10),
  ('Social Butterfly', 'Give 10 likes to other artists', '👍', 'likes_given:10', 15),
  ('Popular Artist', 'Receive 25 likes on your artwork', '⭐', 'likes_received:25', 20),
  ('Daily Creator', 'Post artwork for 7 days in a row', '🔥', 'streak:7', 50),
  ('Master Artist', 'Upload 50 pieces of artwork', '🏆', 'upload_count:50', 100),
  ('Friendly Artist', 'Give 5 likes to other artists', '💖', 'likes_given:5', 5),
  ('Rising Star', 'Receive 10 likes on your artwork', '🌟', 'likes_received:10', 15),
  ('Creative Streak', 'Post artwork for 3 days in a row', '✨', 'streak:3', 25),
  ('Art Explorer', 'Upload 10 pieces of artwork', '🎯', 'upload_count:10', 30)
ON CONFLICT (name) DO NOTHING;

-- Note: Run this in your Supabase SQL Editor to add sample data
-- The child stats and posts will be created when children start using the app