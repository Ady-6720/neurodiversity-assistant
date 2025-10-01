# NeuroEase: Neurodiversity Assistant - Project Index

## 📋 Project Overview

**Project Name:** NeuroEase (Neurodiversity Assistant)  
**Type:** React Native Mobile Application (Expo)  
**Purpose:** Support and empower neurodivergent individuals in daily life  
**Target Users:** People with ADHD, Autism, Dyslexia, and other neurodivergent conditions

---

## 🗂️ Project Structure

```
neurodiversity-assistant/
├── .expo/                          # Expo build artifacts
├── .git/                           # Git version control
├── .vscode/                        # VS Code settings
├── android/                        # Android native code
│   └── app/
│       ├── build.gradle
│       ├── debug.keystore
│       ├── proguard-rules.pro
│       └── src/
│           ├── debug/
│           │   └── AndroidManifest.xml
│           └── main/
│               ├── AndroidManifest.xml
│               ├── java/com/anonymous/neurodiversityassistant/
│               │   ├── MainActivity.kt
│               │   └── MainApplication.kt
│               └── res/                # Android resources (drawables, mipmaps)
├── assets/                         # Static assets (images, fonts)
├── dist/                           # Distribution builds
├── src/                            # Source code (main application)
│   ├── components/                 # Reusable UI components
│   │   ├── ErrorBoundary.js
│   │   ├── StyledButton.js
│   │   ├── StyledCard.js
│   │   ├── StyledText.js
│   │   └── cognitive/              # Cognitive exercise components
│   │       ├── BigButtonExercise.js
│   │       ├── BreatheTimerExercise.js
│   │       ├── ColorTapExercise.js
│   │       ├── DailyChecklistExercise.js
│   │       ├── EnhancedColorTapExercise.js
│   │       ├── MoodCheckExercise.js
│   │       ├── NumberOrderExercise.js
│   │       ├── OddOneOutExercise.js
│   │       ├── SimpleTestExercise.js
│   │       ├── ThisOrThatExercise.js
│   │       └── index.js
│   ├── config/                     # Configuration files
│   │   ├── supabase.js            # Supabase client & helpers
│   │   └── theme.js               # Theme configuration (colors, typography, spacing)
│   ├── contexts/                   # React contexts
│   │   └── AuthContext.js         # Authentication context provider
│   ├── screens/                    # Screen components
│   │   ├── AuthScreen.js
│   │   ├── CognitiveExercisesScreen.js
│   │   ├── CognitiveProgressScreen.js
│   │   ├── CognitiveScreen.js
│   │   ├── FocusScreen.js
│   │   ├── FullScreenExerciseScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LandingScreen.js
│   │   ├── ScheduleScreen.js
│   │   ├── SensoryPreferencesScreen.js
│   │   ├── SensoryScreen.js
│   │   ├── SensoryTrackingScreen.js
│   │   ├── SimpleHomeScreen.js
│   │   ├── SimpleOnboardingScreen.js
│   │   ├── StandardAuthScreen.js
│   │   └── TaskScreen.js
│   └── services/                   # Business logic & API services
│       ├── cognitiveService.js    # Cognitive exercise tracking
│       ├── focusService.js        # Focus session management
│       ├── scheduleService.js     # Schedule/calendar management
│       ├── sensoryService.js      # Sensory preferences & tracking
│       └── taskService.js         # Task management
├── .cursorrules                    # Cursor IDE guidelines
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── App.js                          # Main application entry point
├── README.md                       # Project documentation
├── SUPABASE_SETUP.md              # Supabase setup instructions
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel configuration
├── package.json                    # NPM dependencies
├── package-lock.json               # NPM lock file
└── supabase-schema.sql            # Database schema
```

---

## 🎨 Core Features

### 1. **Authentication & Onboarding**
- User signup/signin with Supabase Auth
- Simple onboarding flow for new users
- User profile management

### 2. **Task Management**
- Create, update, delete tasks
- Priority levels (low, medium, high, urgent)
- Task categories and tags
- Due dates and reminders
- Estimated vs actual duration tracking
- Difficulty and energy level indicators

### 3. **Schedule Management**
- Calendar and routine management
- Event creation with start/end times
- Flexible scheduling options
- Energy cost tracking
- Preparation and recovery time

### 4. **Sensory Support**
- Sensory preference tracking (sound, light, texture, smell)
- Sensitivity level monitoring (1-5 scale)
- Trigger identification
- Coping strategies
- Sensory event logging

### 5. **Cognitive Exercises**
- **Focus Exercises:** Color Tap, Number Order
- **Organization Exercises:** Daily Checklist, Odd One Out
- **Impulse Control:** Big Button, This or That
- **Memory Exercises:** Various memory games
- Performance tracking and analytics
- Progress monitoring with statistics

### 6. **Focus Tools**
- Pomodoro timer
- Deep work sessions
- Break tracking
- Interruption logging
- Focus rating system

### 7. **Communication Templates**
- Pre-written communication aids
- Category-based templates (work, social, emergency)
- Favorite templates
- Usage tracking

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React Native 0.76.7
- **UI Library:** React Native Paper 5.12.5
- **Navigation:** React Navigation 6.x (Stack & Bottom Tabs)
- **State Management:** React Context API
- **Icons:** Material Community Icons (@expo/vector-icons)
- **Runtime:** Expo 50.0.0

### **Backend & Database**
- **Backend as a Service:** Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Storage:** AsyncStorage (local), Supabase (cloud)

### **Development Tools**
- **Build Tool:** Expo CLI
- **Bundler:** Metro
- **Transpiler:** Babel
- **Package Manager:** NPM

### **Key Dependencies**
```json
{
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "@react-navigation/stack": "^6.3.20",
  "@supabase/supabase-js": "^2.53.0",
  "expo": "^50.0.0",
  "expo-notifications": "~0.29.13",
  "expo-speech": "~13.0.1",
  "react": "^18.3.1",
  "react-native": "^0.76.7",
  "react-native-paper": "^5.12.5"
}
```

---

## 🗄️ Database Schema

### **Core Tables**

#### **user_profiles**
- Extended user information
- Neurodiversity type tracking
- User preferences (JSON)
- Display name

#### **tasks**
- Task management
- Priority, status, category
- Due dates and reminders
- Duration tracking (estimated/actual)
- Difficulty and energy levels
- Recurring task support

#### **schedules**
- Calendar events
- Start/end times
- Energy cost tracking
- Preparation/recovery time
- Flexible scheduling flag

#### **sensory_preferences**
- Sensory type (sound, light, texture, smell)
- Sensitivity levels (1-5)
- Triggers array
- Coping strategies
- Preferred environments

#### **sensory_events**
- Event tracking
- Intensity levels
- Trigger logging
- Coping strategy effectiveness

#### **focus_sessions**
- Session type (pomodoro, deep work, break)
- Duration tracking
- Interruption count
- Focus rating (1-5)
- Environment factors

#### **cognitive_exercises**
- Exercise completion tracking
- Score and accuracy
- Duration tracking
- Performance rating
- Section and type categorization

#### **communication_templates**
- Template text storage
- Category organization
- Favorite marking
- Usage statistics

#### **cognitive_entries**
- Memory aids
- Planning notes
- Reflections
- Importance levels
- Task linking

---

## 🎨 Theme & Design System

### **Color Palette**
- **Primary:** #4A90E2 (Sky Blue)
- **Secondary:** #7FB069 (Sage Green)
- **Tertiary:** #9B7BB8 (Lavender)
- **Background:** #F8FAFC (Light Blue-Grey)
- **Surface:** #FFFFFF (White)
- **Text:** #1F2937 (Dark Blue-Grey)
- **Success:** #10B981 (Green)
- **Warning:** #F59E0B (Orange)
- **Error:** #EF4444 (Red)

### **Typography**
- **Sizes:** xs(12), sm(14), md(16), lg(18), xl(22), xxl(26)
- **Weights:** regular(400), medium(500), semibold(600), bold(700)
- **Families:** System fonts

### **Spacing**
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 40px

### **Shapes**
- Border radius: sm(4), md(8), lg(12), xl(16), round(9999)
- Button height: 48px
- Icon sizes: sm(16), md(24), lg(32), xl(40)

---

## 📱 Navigation Structure

### **Main Tab Navigator**
1. **Home** - Dashboard and overview
2. **Sensory** - Sensory management tools
3. **Tasks** - Task list and management
4. **Schedule** - Calendar and events
5. **Cognitive** - Cognitive exercises (Stack Navigator)

### **Cognitive Stack**
- CognitiveMain - Exercise categories
- CognitiveExercises - Exercise list
- CognitiveProgress - Progress tracking
- FullScreenExercise - Exercise execution

---

## 🔐 Security Features

### **Row Level Security (RLS)**
- Users can only access their own data
- Automatic user profile creation on signup
- Secure authentication flow

### **Environment Variables**
- Supabase URL and keys stored in `.env.local`
- Never committed to version control
- Example template in `.env.example`

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js and NPM
- Expo CLI
- Supabase account

### **Installation**
```bash
# Clone repository
git clone https://github.com/Ady-6720/neurodiversity-assistant.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm start
```

### **Supabase Setup**
1. Create Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Configure environment variables
4. Test authentication flow

---

## 📊 Key Services

### **taskService.js**
- `createTask()` - Create new task
- `getUserTasks()` - Fetch user tasks with filters
- `updateTask()` - Update task details
- `toggleTaskCompletion()` - Mark complete/incomplete
- `deleteTask()` - Remove task
- `getTaskStats()` - Get statistics
- `getTodaysTasks()` - Fetch today's tasks
- `getOverdueTasks()` - Fetch overdue tasks

### **cognitiveService.js**
- `trackExerciseCompletion()` - Log exercise results
- `getExerciseHistory()` - Fetch history
- `getExerciseStats()` - Calculate statistics
- `getExerciseTypeStats()` - Type-specific stats
- `getProgressSummary()` - Overall progress
- `getRecommendedExercises()` - AI recommendations
- `getExerciseAnalytics()` - Chart data

### **sensoryService.js**
- Sensory preference management
- Event tracking
- Trigger analysis
- Coping strategy effectiveness

### **scheduleService.js**
- Event CRUD operations
- Calendar management
- Energy tracking

### **focusService.js**
- Focus session tracking
- Pomodoro timer management
- Performance analytics

---

## 🧩 Component Architecture

### **Styled Components**
- `StyledButton.js` - Themed button component
- `StyledCard.js` - Card wrapper
- `StyledText.js` - Typography component
- `ErrorBoundary.js` - Error handling wrapper

### **Cognitive Exercise Components**
All exercises follow a consistent interface:
- Props: `onComplete`, `onExit`
- State management for exercise logic
- Performance tracking
- Visual feedback

---

## 📝 Development Guidelines

### **Code Style**
- Functional components with hooks
- Expo SDK-native APIs preferred
- React Navigation for routing
- StyleSheet API for styling
- Secure storage for sensitive data

### **Best Practices**
- Error boundaries for production
- Safe area context for device compatibility
- Push notification system
- Offline support considerations
- TypeScript recommended (currently JS)

### **Prohibited**
- Inline styles
- Global styles across components
- Hardcoded secrets
- AsyncStorage for sensitive data
- Unix shell operators in scripts

---

## 🔄 State Management

### **AuthContext**
- User authentication state
- Profile management
- Onboarding status
- Sign in/out methods

### **Local State**
- Component-level useState
- Screen-specific state management

### **Future Considerations**
- Redux Toolkit for complex state
- React Query for server state
- Persistence layer

---

## 📈 Analytics & Tracking

### **Cognitive Performance**
- Exercise completion rates
- Accuracy percentages
- Duration tracking
- Performance ratings (1-5)
- Section-wise analytics
- Trend analysis

### **Task Analytics**
- Completion rates
- Priority breakdown
- Category distribution
- Time estimates vs actuals

### **Focus Analytics**
- Session duration
- Interruption tracking
- Focus ratings
- Environment factors

---

## 🎯 Future Enhancements

### **Planned Features**
- Real-time collaboration
- Social features
- Advanced analytics dashboard
- Customizable themes
- Voice commands
- Wearable integration
- Offline mode improvements

### **Technical Debt**
- Migration to TypeScript
- Unit test coverage
- E2E testing
- Performance optimization
- Code splitting
- Bundle size reduction

---

## 📞 Support & Resources

### **Documentation**
- `README.md` - Project overview
- `SUPABASE_SETUP.md` - Backend setup
- `.cursorrules` - Development guidelines

### **External Resources**
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)

---

## 📄 License

MIT License - Built with ❤️ for the neurodivergent community

---

**Last Updated:** 2025-10-01  
**Version:** 1.0.0  
**Maintainer:** Ady-6720
