# Exercise-Specific Metrics TODO

## Current Status
✅ Fixed: Basic best score loading in FullScreenExerciseScreen
⚠️ TODO: Display exercise-specific metrics in completion dialog

## Exercise Types and Their Relevant Metrics

### 1. **Color Tap** (color-tap)
- ✅ Score (X/10)
- ✅ Accuracy (%)
- ✅ Time taken
- 📊 Best: Highest accuracy, Fastest time

### 2. **Big Button** (big-button) - REACTION TIME GAME
- ✅ Score (successful taps/10)
- ⭐ **Average Reaction Time** (ms) - PRIMARY METRIC
- ⭐ **Fastest Reaction Time** (ms)
- ❌ Remove: Accuracy % (not relevant)
- 📊 Best: Fastest average reaction time

### 3. **Number Order** (number-order) - MEMORY GAME
- ✅ Score (X/10)
- ✅ Accuracy (%)
- ⭐ **Longest Sequence** remembered
- ✅ Time taken
- 📊 Best: Highest score, Longest sequence

### 4. **This or That** (this-or-that)
- ✅ Score
- ✅ Accuracy (%)
- ✅ Time taken
- 📊 Best: Highest accuracy

### 5. **Odd One Out** (odd-one-out)
- ✅ Score
- ✅ Accuracy (%)
- ✅ Time taken
- 📊 Best: Highest accuracy

### 6. **Breathe Timer** (breathe-timer) - WELLNESS
- ⭐ **Duration completed** (minutes)
- ⭐ **Streak** (consecutive days)
- ❌ Remove: Score/Accuracy (not relevant)
- 📊 Best: Longest session, Current streak

### 7. **Daily Checklist** (daily-checklist)
- ✅ Items completed (X/Y)
- ⭐ **Completion rate** (%)
- ❌ Remove: Accuracy (same as completion rate)
- 📊 Best: Most items completed

### 8. **Mood Check** (mood-check) - TRACKING
- ⭐ **Current mood**
- ⭐ **Mood trend** (improving/stable/declining)
- ❌ Remove: Score/Accuracy (not relevant)
- 📊 Best: Mood history graph

## Implementation Plan

### Phase 1: Update BigButtonExercise to pass reaction time data
```javascript
// In BigButtonExercise.js
onComplete(currentScore, totalRounds, {
  avgReactionTime: Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length),
  fastestReaction: Math.min(...reactionTimes),
  reactionTimes: reactionTimes
});
```

### Phase 2: Create smart completion dialog
```javascript
// In FullScreenExerciseScreen.js
const renderCompletionStats = () => {
  switch (completionData.exerciseType) {
    case 'big-button':
      return (
        <>
          <StatRow label="Score" value={`${score}/${totalQuestions}`} />
          <StatRow label="Avg Reaction" value={`${avgReactionTime}ms`} highlight />
          <StatRow label="Fastest" value={`${fastestReaction}ms`} />
          {bestScore && (
            <StatRow label="Your Best" value={`${bestScore.avgReactionTime}ms`} />
          )}
        </>
      );
    case 'breathe-timer':
      return (
        <>
          <StatRow label="Duration" value={`${duration}min`} highlight />
          <StatRow label="Streak" value={`${streak} days`} />
        </>
      );
    // ... other cases
  }
};
```

### Phase 3: Update cognitiveService to track exercise-specific data
- Modify `trackExerciseCompletion` to accept and store extra metrics
- Update Firestore schema to include `extra_metrics` field

### Phase 4: Display best scores on exercise cards
- Show relevant "Your Best" metric on CognitiveScreen exercise cards
- Example: "Your Best: 245ms" for Big Button

## Quick Win: Commit current progress
The basic infrastructure is in place. Next session can implement the specific metrics display.
