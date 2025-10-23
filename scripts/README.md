# Database Maintenance Scripts

This directory contains utility scripts for database maintenance and migrations.

## Normalize Hashtags Script

### Purpose
Normalizes all photo hashtags in the database to lowercase for consistent, case-insensitive searching.

### When to Use
- After updating the app to support case-insensitive hashtag filtering
- When you have existing photos with mixed-case hashtags (e.g., "Brunch", "AfroBeats")
- To ensure all hashtags are searchable regardless of case

### How to Run

1. **Make sure your `.env` file is set up** with Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. **Run the script:**
   ```bash
   npm run normalize-hashtags
   ```

### What It Does

1. Connects to your Firestore database
2. Fetches all photos
3. For each photo with hashtags:
   - Converts all hashtags to lowercase
   - Updates the photo document if changes are needed
   - Skips photos that are already normalized
4. Provides a detailed summary of the operation

### Output Example

```
🚀 Starting hashtag normalization...

📸 Found 45 photos to process

✅ Updated photo abc123
   Before: [Brunch, AfroBeats, NYC]
   After:  [brunch, afrobeats, nyc]

✓ Photo def456 - already normalized
⏭️  Skipping photo ghi789 (no hashtags)

========================================
📊 SUMMARY
========================================
Total photos processed: 45
✅ Updated: 12
⏭️  Skipped (no changes needed): 30
❌ Errors: 0
========================================

✨ Hashtag normalization completed successfully!
```

### Safety Features

- **Non-destructive**: Only updates hashtags, preserves all other photo data
- **Idempotent**: Safe to run multiple times (will skip already normalized photos)
- **Detailed logging**: Shows exactly what changes are being made
- **Error handling**: Continues processing even if individual updates fail

### Important Notes

⚠️ **Backup Recommended**: Although the script is safe, it's always good practice to backup your Firestore data before running bulk updates.

⚠️ **Firestore Rules**: Ensure your Firestore security rules allow updates to the photos collection from the script's execution environment.

### Troubleshooting

**Error: "Permission denied"**
- Check your Firebase security rules
- Ensure the script has proper authentication

**Error: "Environment variables not found"**
- Verify your `.env` file exists in the project root
- Check that all required variables are set

**Script runs but no photos are updated**
- All hashtags may already be normalized
- Check the console output for details
