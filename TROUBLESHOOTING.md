# Troubleshooting Database Issues

## Step 1: Update Firestore Rules
Copy the ENTIRE content from `firestore.rules` and paste it into Firebase Console:
https://console.firebase.google.com/project/neuroease2/firestore/rules

Click **Publish**

## Step 2: Verify Indexes Are Built
Go to: https://console.firebase.google.com/project/neuroease2/firestore/indexes

Make sure ALL indexes show status: **Enabled** (not "Building")

If any show "Building", wait until they're done.

## Step 3: Check Browser Console
1. Open your app in browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Try to create a task
5. Look for errors - they should show:
   - Exact error message
   - Which collection is failing
   - Permission denied or index missing

## Step 4: Test Firebase Connection
Open browser console and run this:

```javascript
// Check if user is logged in
console.log('User:', auth.currentUser);

// Check user ID
console.log('User UID:', auth.currentUser?.uid);
```

## Common Issues:

### Issue 1: "Missing or insufficient permissions"
- **Fix**: Update Firestore rules (Step 1)

### Issue 2: "The query requires an index"
- **Fix**: Create the index (Firebase will show a link in the error)

### Issue 3: "user.id is undefined"
- **Fix**: Already fixed - we changed all `user.id` to `user.uid`

### Issue 4: Indexes still building
- **Fix**: Wait 2-3 minutes, then refresh

## What to Send Me:
If still not working, send me:
1. Screenshot of browser console errors
2. Screenshot of Firestore Rules page
3. Screenshot of Firestore Indexes page (showing status)
