### Neurodiversity Assistant — File Index

This document indexes the repository structure (excluding `node_modules` contents) and highlights key configuration files to help you quickly navigate the project.

## Project Type
- React Native + Expo app
- Uses Firebase
- Web export configured via Expo

## Key Config
- `package.json`: scripts, dependencies
- `app.json`: Expo app config
- `babel.config.js`: Babel configuration
- `firestore.rules`, `firestore.indexes.json`: Firebase security rules and indexes

## Scripts (from `package.json`)
- `start`: expo start
- `android`: expo start --android
- `ios`: expo start --ios
- `web`: expo start --web
- `build:web`: expo export:web
- `predeploy`: npm run build:web
- `deploy`: gh-pages -d web-build

## Repository Tree

```text
.
├─ App.js
├─ app.json
├─ assets/
│  ├─ adaptive-icon.png
│  ├─ favicon.png
│  ├─ icon.png
│  └─ splash.png
├─ babel.config.js
├─ DEPLOYMENT.md
├─ dist/
│  ├─ _expo/static/js/web/AppEntry-<hash>.js
│  ├─ favicon.ico
│  ├─ index.html
│  └─ metadata.json
├─ firestore.indexes.json
├─ firestore.rules
├─ fix-expo.ps1
├─ android/
│  ├─ app/
│  │  ├─ build.gradle
│  │  ├─ debug.keystore
│  │  ├─ proguard-rules.pro
│  │  └─ src/
│  │     ├─ debug/AndroidManifest.xml
│  │     └─ main/
│  │        ├─ AndroidManifest.xml
│  │        ├─ java/com/anonymous/... (native sources)
│  │        └─ res/
│  │           ├─ drawable*/
│  │           ├─ mipmap*/
│  │           └─ values*/
│  ├─ build.gradle
│  ├─ gradle/
│  │  └─ wrapper/
│  │     ├─ gradle-wrapper.jar
│  │     └─ gradle-wrapper.properties
│  ├─ gradle.properties
│  ├─ gradlew
│  ├─ gradlew.bat
│  └─ settings.gradle
├─ node_modules/ (omitted)
├─ package-lock.json
├─ package.json
├─ PROJECT_REPORT.md
├─ README.md
├─ run.ps1
├─ src/
│  ├─ components/
│  │  ├─ ErrorBoundary.js
│  │  ├─ StyledButton.js
│  │  ├─ StyledCard.js
│  │  ├─ StyledText.js
│  │  └─ cognitive/
│  │     ├─ BigButtonExercise.js
│  │     ├─ BreatheTimerExercise.js
│  │     ├─ ColorTapExercise.js
│  │     ├─ DailyChecklistExercise.js
│  │     ├─ EnhancedColorTapExercise.js
│  │     ├─ FeedbackAnimation.js
│  │     ├─ index.js
│  │     ├─ MindfulPauseExercise.js
│  │     ├─ MoodCheckExercise.js
│  │     ├─ NumberOrderExercise.js
│  │     ├─ OddOneOutExercise.js
│  │     ├─ SimpleTestExercise.js
│  │     ├─ StopThinkExercise.js
│  │     ├─ ThisOrThatExercise.js
│  │     └─ WaitForItExercise.js
│  ├─ config/
│  │  ├─ firebase.js
│  │  └─ theme.js
│  ├─ contexts/
│  │  └─ AuthContext.js
│  ├─ screens/
│  │  ├─ AuthScreen.js
│  │  ├─ CognitiveExercisesScreen.js
│  │  ├─ CognitiveProgressScreen.js
│  │  ├─ CognitiveScreen.js
│  │  ├─ DashboardScreen.js
│  │  ├─ EmailVerificationScreen.js
│  │  ├─ FocusScreen.js
│  │  ├─ FullScreenExerciseScreen.js
│  │  ├─ HomeScreen.js
│  │  ├─ LandingScreen.js
│  │  ├─ LeaderboardScreen.js
│  │  ├─ OnboardingPreferencesScreen.js
│  │  ├─ OnboardingProfileScreen.js
│  │  ├─ ProfileScreen.js
│  │  ├─ ScheduleScreen.js
│  │  ├─ SensoryPreferencesScreen.js
│  │  ├─ SensoryScreen.js
│  │  ├─ SensoryTrackingScreen.js
│  │  ├─ SimpleHomeScreen.js
│  │  ├─ SimpleOnboardingScreen.js
│  │  ├─ StandardAuthScreen.js
│  │  └─ TaskScreen.js
│  └─ services/
│     ├─ cognitiveService.js
│     ├─ focusService.js
│     ├─ scheduleService.js
│     ├─ sensoryService.js
│     └─ taskService.js
├─ TROUBLESHOOTING.md
└─ dist/ (web build artifacts)
```

## Notes
- The `dist/` directory contains web export artifacts; contents may change per build.
- Android native scaffolding is present under `android/` for build customization.
- All cognitive exercise components live under `src/components/cognitive/`.


