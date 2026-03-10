-- ============================================
-- Linguability: XP & Leaderboard SQL Migrations
-- ============================================
-- Run these SQL statements in your Supabase SQL editor
-- to enable XP tracking and leaderboard functionality.

-- ============================================
-- 1. Add XP and Avatar columns to profiles
-- ============================================

-- Add total_xp column to track user XP
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Add avatar_id column for custom avatar selection
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(50) DEFAULT 'default';

-- Add index for leaderboard queries (sorting by XP)
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp 
ON profiles(total_xp DESC);

-- ============================================
-- 2. Create XP History Table (Optional)
-- ============================================
-- This tracks XP gains over time for analytics

CREATE TABLE IF NOT EXISTS xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user XP history lookups
CREATE INDEX IF NOT EXISTS idx_xp_history_user 
ON xp_history(user_id, created_at DESC);

-- ============================================
-- 3. Function to Add XP to User
-- ============================================
-- Call this function when user earns XP

CREATE OR REPLACE FUNCTION add_user_xp(
    p_user_id UUID,
    p_xp_amount INTEGER,
    p_reason VARCHAR(255)
)
RETURNS INTEGER AS $$
DECLARE
    new_total INTEGER;
BEGIN
    -- Update total XP
    UPDATE profiles 
    SET total_xp = COALESCE(total_xp, 0) + p_xp_amount,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING total_xp INTO new_total;
    
    -- Log XP gain
    INSERT INTO xp_history (user_id, xp_amount, reason)
    VALUES (p_user_id, p_xp_amount, p_reason);
    
    RETURN new_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. XP Reward Values
-- ============================================
-- Reference for XP amounts given for activities:
--
-- LESSON COMPLETION:
--   - Complete lesson: 25 XP
--   - Start lesson (in progress): 5 XP
--
-- QUIZ/ASSESSMENT:
--   - Complete quiz: 20 XP
--   - Perfect score (100%): +30 XP bonus
--   - Good score (80%+): +15 XP bonus
--
-- STREAK:
--   - Daily login: 5 XP
--   - 3-day streak: 30 XP badge
--   - 7-day streak: 75 XP badge
--   - 30-day streak: 300 XP badge
--
-- ACHIEVEMENTS:
--   - First Steps (1 lesson): 10 XP
--   - Getting Started (5 lessons): 25 XP
--   - Dedicated Learner (10 lessons): 50 XP
--   - Linguist (2 languages): 40 XP
--   - Polyglot (4 languages): 150 XP
--   - Century (25 lessons): 100 XP
--   - Language Master (complete 1 language): 200 XP

-- ============================================
-- 5. Leaderboard View (Optional Performance Optimization)
-- ============================================

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_id,
    COALESCE(p.total_xp, 0) as total_xp,
    RANK() OVER (ORDER BY COALESCE(p.total_xp, 0) DESC) as rank,
    CASE 
        WHEN COALESCE(p.total_xp, 0) >= 1000 THEN 'Legend'
        WHEN COALESCE(p.total_xp, 0) >= 500 THEN 'Master'
        WHEN COALESCE(p.total_xp, 0) >= 300 THEN 'Expert'
        WHEN COALESCE(p.total_xp, 0) >= 150 THEN 'Advanced'
        WHEN COALESCE(p.total_xp, 0) >= 50 THEN 'Intermediate'
        ELSE 'Beginner'
    END as level_title
FROM profiles p
WHERE p.full_name IS NOT NULL
ORDER BY total_xp DESC;

-- ============================================
-- 6. Row Level Security (RLS) Policies
-- ============================================

-- Allow users to read all profiles for leaderboard
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- XP history - users can only see their own
CREATE POLICY "Users can view own XP history" 
ON xp_history FOR SELECT 
USING (auth.uid() = user_id);

-- XP history - only system can insert (via function)
CREATE POLICY "Only system can insert XP history" 
ON xp_history FOR INSERT 
WITH CHECK (false);

-- ============================================
-- 7. Weekly Leaderboard Reset (Optional)
-- ============================================
-- If you want weekly competitions, create a separate table

CREATE TABLE IF NOT EXISTS weekly_xp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    UNIQUE(user_id, week_start)
);

-- Index for weekly leaderboard
CREATE INDEX IF NOT EXISTS idx_weekly_xp_week 
ON weekly_xp(week_start DESC, xp_earned DESC);

-- ============================================
-- USAGE EXAMPLES:
-- ============================================
--
-- Add XP when user completes a lesson:
--   SELECT add_user_xp('user-uuid-here', 25, 'Completed lesson: Hindi Words 1');
--
-- Get leaderboard:
--   SELECT * FROM leaderboard_view LIMIT 50;
--
-- Get user's rank:
--   SELECT * FROM leaderboard_view WHERE id = 'user-uuid-here';
--
-- ============================================
