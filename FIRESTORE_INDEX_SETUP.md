# Firestore Index Setup Guide

## Quick Setup (Recommended - Easiest)

When you run the tests and see "Missing Firestore index" errors:

1. **Open your browser's Developer Console** (F12 or Cmd+Option+I)
2. **Look for error messages** that include links like:
   ```
   https://console.firebase.google.com/v1/r/project/YOUR-PROJECT/firestore/indexes?create_composite=...
   ```
3. **Click each link** - This will open the Firebase Console and auto-populate the index configuration
4. **Click "Create Index"** in the Firebase Console
5. **Wait 2-5 minutes** for the indexes to build
6. **Refresh the test page** and run the tests again

## Alternative Method: Deploy All Indexes at Once

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)

```bash
firebase init firestore
```

Select:
- Your Firebase project
- Keep default firestore.rules
- Keep default firestore.indexes.json (we already created it)

### Step 4: Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

This will deploy all 21 indexes defined in `firestore.indexes.json`.

⏱️ **Build time**: 2-10 minutes depending on existing data

## Verify Index Status

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Check that all indexes show status: **Enabled** (not "Building")

## Required Indexes (21 total)

### Events Collection (20 indexes)

#### Basic Sorting
1. `date` (ASC) - single field
2. `date` (DESC) - single field

#### Category Queries
3. `category` (ASC) + `date` (ASC)
4. `category` (ASC) + `date` (DESC)
5. `category` (ASC) + `favoritesCount` (DESC) + `date` (ASC)
6. `category` (ASC) + `favoritesCount` (DESC) + `date` (DESC)
7. `category` (ASC) + `favoritesCount` (DESC) + `createdAt` (DESC)

#### Promoter Queries
8. `promoterId` (ASC) + `date` (ASC)
9. `promoterId` (ASC) + `date` (DESC)
10. `promoterId` (ASC) + `favoritesCount` (DESC) + `date` (ASC)
11. `promoterId` (ASC) + `favoritesCount` (DESC) + `date` (DESC)
12. `promoterId` (ASC) + `favoritesCount` (DESC) + `createdAt` (DESC)

#### Popularity/Trending
13. `favoritesCount` (DESC) + `date` (ASC)
14. `favoritesCount` (DESC) + `date` (DESC)
15. `favoritesCount` (DESC) + `createdAt` (DESC)

#### Hashtag Queries
16. `hashtags` (ARRAY_CONTAINS) + `date` (ASC)
17. `hashtags` (ARRAY_CONTAINS) + `date` (DESC)
18. `hashtags` (ARRAY_CONTAINS) + `category` (ASC) + `date` (ASC)
19. `hashtags` (ARRAY_CONTAINS) + `category` (ASC) + `date` (DESC)
20. `hashtags` (ARRAY_CONTAINS) + `favoritesCount` (DESC) + `date` (ASC)

### Hashtags Collection (1 index)

21. `usageCount` (DESC) + `lastUsed` (DESC)

## Troubleshooting

### Error: "Index creation failed"
- **Cause**: Existing data might violate index constraints
- **Solution**: Check that all events have the required fields (date, category, favoritesCount, etc.)

### Error: "Permission denied"
- **Cause**: Not logged in to Firebase CLI or wrong project
- **Solution**:
  ```bash
  firebase logout
  firebase login
  firebase use --add  # Select correct project
  ```

### Indexes stuck in "Building" status
- **Normal**: Small datasets (< 1000 docs) = 2-5 minutes
- **Large datasets**: Could take 10-30 minutes
- **Check**: Firestore Console → Indexes tab

### Query still failing after index is created
- **Cause**: Browser cache or old connection
- **Solution**:
  1. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+F5)
  2. Clear browser cache
  3. Restart dev server

## Cost Considerations

- ✅ **Index creation is FREE**
- ✅ **Index storage is FREE** (up to 1GB)
- ✅ **Index reads are FREE** (indexes don't count toward read quota)
- ⚠️ **Index writes**: Each document write updates all relevant indexes (minimal cost)

**Bottom line**: Don't worry about having 21 indexes - they're free and make queries MUCH faster!

## Performance Impact

With indexes:
- ✅ Queries: **~50-100ms** (fast!)
- ✅ Pagination: **~20-50ms** (very fast!)
- ✅ Sorting: **~30-80ms** (fast!)

Without indexes:
- ❌ Most queries will **fail** with "requires an index" error
- ❌ Some simple queries work but are **very slow** (1000ms+)

## Next Steps After Setup

1. ✅ Run the Enhanced Tests (`/firebase-test` page)
2. ✅ All tests should pass (green)
3. ✅ Check that pagination works smoothly
4. ✅ Verify real-time listeners update correctly

---

**Need Help?** Open an issue in the repository with:
- Screenshot of the error
- Link from browser console
- Firestore Console screenshot showing index status
