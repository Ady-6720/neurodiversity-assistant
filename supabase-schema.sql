-- NeuroEase Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    display_name TEXT,
    neurodiversity_type TEXT[], -- e.g., ['ADHD', 'Autism', 'Dyslexia']
    preferences JSONB DEFAULT '{}', -- Store user preferences as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    category TEXT DEFAULT 'general', -- e.g., 'focus', 'sensory', 'communication'
    due_date TIMESTAMP WITH TIME ZONE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    energy_level_required INTEGER DEFAULT 3 CHECK (energy_level_required BETWEEN 1 AND 5),
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern TEXT, -- e.g., 'daily', 'weekly', 'monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'general',
    location TEXT,
    reminder_minutes INTEGER DEFAULT 15,
    color TEXT DEFAULT '#7CB9E8', -- Default to primary color
    is_flexible BOOLEAN DEFAULT FALSE, -- Can be moved if needed
    energy_cost INTEGER DEFAULT 3 CHECK (energy_cost BETWEEN 1 AND 5),
    preparation_time INTEGER DEFAULT 0, -- minutes needed to prepare
    recovery_time INTEGER DEFAULT 0, -- minutes needed to recover
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensory preferences table
CREATE TABLE IF NOT EXISTS public.sensory_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sensory_type TEXT NOT NULL, -- e.g., 'sound', 'light', 'texture', 'smell'
    sensitivity_level INTEGER DEFAULT 3 CHECK (sensitivity_level BETWEEN 1 AND 5),
    triggers TEXT[], -- Array of specific triggers
    coping_strategies TEXT[], -- Array of coping strategies
    preferred_environments JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create focus sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT DEFAULT 'pomodoro', -- e.g., 'pomodoro', 'deep_work', 'break'
    duration_minutes INTEGER NOT NULL,
    actual_duration_minutes INTEGER,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    interruptions INTEGER DEFAULT 0,
    focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5),
    notes TEXT,
    environment_factors JSONB DEFAULT '{}', -- noise level, lighting, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication templates table
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    template_text TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- e.g., 'work', 'social', 'emergency'
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cognitive support entries table
CREATE TABLE IF NOT EXISTS public.cognitive_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL, -- e.g., 'memory_aid', 'planning_note', 'reflection'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    importance_level INTEGER DEFAULT 3 CHECK (importance_level BETWEEN 1 AND 5),
    is_archived BOOLEAN DEFAULT FALSE,
    linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensory events tracking table
CREATE TABLE IF NOT EXISTS public.sensory_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sensory_type TEXT NOT NULL, -- e.g., 'sound', 'light', 'texture', 'smell'
    intensity_level INTEGER NOT NULL CHECK (intensity_level BETWEEN 1 AND 5),
    triggers TEXT[], -- Array of specific triggers that caused the event
    coping_strategies TEXT[], -- Array of strategies used to cope
    notes TEXT, -- Additional notes about the event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cognitive exercises tracking table
CREATE TABLE IF NOT EXISTS public.cognitive_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL, -- e.g., 'color-tap', 'number-order', 'big-button'
    exercise_name TEXT NOT NULL,
    exercise_type TEXT NOT NULL, -- e.g., 'tap', 'choice', 'timer', 'toggle'
    section_id TEXT NOT NULL, -- e.g., 'focus', 'organization', 'impulse', 'memory'
    section_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_start_time ON public.focus_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_cognitive_exercises_user_id ON public.cognitive_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_exercises_exercise_id ON public.cognitive_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_exercises_created_at ON public.cognitive_exercises(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own schedules" ON public.schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sensory preferences" ON public.sensory_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sensory events" ON public.sensory_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own focus sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own communication templates" ON public.communication_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cognitive entries" ON public.cognitive_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cognitive exercises" ON public.cognitive_exercises FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sensory_preferences_updated_at BEFORE UPDATE ON public.sensory_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON public.communication_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cognitive_entries_updated_at BEFORE UPDATE ON public.cognitive_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
