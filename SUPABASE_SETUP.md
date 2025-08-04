# Supabase Setup Guide for NeuroEase

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose organization and enter project details:
   - **Name**: `neuroeasy-app` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users

### 2. Get Your Project Credentials
After project creation (takes ~2 minutes):
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Set Up Environment Variables (REQUIRED)
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and add your actual Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

⚠️ **SECURITY WARNING**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Set Up Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This creates all necessary tables and security policies

### 5. Configure Authentication (Optional)
1. Go to **Authentication** → **Settings**
2. Enable desired providers:
   - **Email**: Already enabled
   - **Google**: Add OAuth credentials
   - **GitHub**: Add OAuth app details

## 🗄️ Database Schema Overview

### Core Tables Created:
- **user_profiles**: Extended user information and preferences
- **tasks**: Task management with neurodiversity-specific fields
- **schedules**: Calendar and routine management
- **sensory_preferences**: Sensory sensitivity tracking
- **focus_sessions**: Pomodoro and focus tracking
- **communication_templates**: Pre-written communication aids
- **cognitive_entries**: Memory aids and planning notes

### Key Features:
- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic timestamps**: Created/updated timestamps on all records
- **User profile auto-creation**: Profile created automatically on signup
- **Flexible JSON fields**: Store complex preferences and settings

## 🔧 Environment Variables Setup Complete
Environment variables are now required and configured in step 3 above. The app will not start without proper `.env.local` configuration.

## 🧪 Testing Your Setup

1. Start your app: `npm run web`
2. Try creating an account
3. Check Supabase Dashboard → **Authentication** → **Users**
4. Verify user profile was created in **Table Editor** → **user_profiles**

## 🔒 Security Notes

- Never commit your actual Supabase keys to version control
- The anon key is safe for client-side use (it's designed for that)
- RLS policies ensure users can only access their own data
- For production, consider additional security measures

## 📚 Next Steps

After setup:
1. Test authentication flow
2. Implement task CRUD operations
3. Add real-time subscriptions for live updates
4. Customize user preferences and neurodiversity settings

## 🆘 Troubleshooting

**Authentication not working?**
- Check your Supabase URL and key are correct
- Verify RLS policies are enabled
- Check browser console for errors

**Database errors?**
- Ensure schema was applied correctly
- Check table permissions in Supabase dashboard
- Verify user has proper access

**Need help?**
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Community: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
