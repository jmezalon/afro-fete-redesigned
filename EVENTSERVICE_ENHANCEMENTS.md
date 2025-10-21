# EventService Enhanced Features Documentation

This document describes the advanced features added to `eventService.js` for improved query capabilities, real-time updates, batch operations, and search functionality.

## Table of Contents
1. [Advanced Query Capabilities](#advanced-query-capabilities)
2. [Real-time Listeners](#real-time-listeners)
3. [Batch Operations](#batch-operations)
4. [Search Functionality](#search-functionality)
5. [Firestore Indexes Setup](#firestore-indexes-setup)
6. [Testing](#testing)
7. [Performance Optimization](#performance-optimization)

---

## Advanced Query Capabilities

### Enhanced `getEvents()` Function

The `getEvents()` function now supports compound queries with multiple filters, pagination, and advanced sorting.

#### Features:
- **Multiple filter combinations**: category + hashtag + date range + promoter + price
- **Pagination**: Cursor-based pagination with `startAfterDoc`
- **Sorting options**: Sort by date, popularity, or trending
- **Price filtering**: Min/max price range (done in-memory for efficiency)

#### Usage Examples:

```javascript
// Example 1: Get upcoming nightlife events
const result = await getEvents({
  category: 'nightlife',
  startDate: new Date().toISOString(),
  limit: 10,
  sortBy: 'date',
  sortOrder: 'asc'
});

console.log(result.events);        // Array of events
console.log(result.hasMore);       // Boolean indicating more results
console.log(result.lastDoc);       // Last document for pagination
```

```javascript
// Example 2: Get popular events with pagination
const page1 = await getEvents({
  sortBy: 'popularity',
  limit: 20
});

// Get next page
const page2 = await getEvents({
  sortBy: 'popularity',
  limit: 20,
  startAfterDoc: page1.lastDoc
});
```

```javascript
// Example 3: Complex compound query
const result = await getEvents({
  category: 'brunch',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  minPrice: 0,
  maxPrice: 50,
  sortBy: 'date',
  limit: 15
});
```

#### Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by event category |
| `hashtag` | string | Filter by hashtag (array-contains) |
| `startDate` | string | Filter events on/after this date (ISO string) |
| `endDate` | string | Filter events before this date (ISO string) |
| `promoterId` | string | Filter by promoter ID |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `limit` | number | Max events to return (default: 20) |
| `sortBy` | string | 'date', 'popularity', or 'trending' |
| `sortOrder` | string | 'asc' or 'desc' (default: 'asc') |
| `startAfterDoc` | DocumentSnapshot | Document from previous query for pagination |

#### Return Value:

```javascript
{
  events: [],        // Array of event objects
  lastDoc: null,     // DocumentSnapshot for pagination
  hasMore: false,    // Boolean indicating if more results exist
  count: 0           // Number of events returned
}
```

---

## Real-time Listeners

Real-time listeners provide live updates when data changes in Firestore.

### 1. `subscribeToEvents(filters, callback)`

Subscribe to real-time event updates with optional filters.

```javascript
import { subscribeToEvents } from '../services/eventService';

const unsubscribe = subscribeToEvents(
  {
    category: 'nightlife',
    startDate: new Date().toISOString(),
    limit: 20
  },
  (events) => {
    console.log('Events updated:', events);
    setEvents(events); // Update React state
  }
);

// Clean up when component unmounts
useEffect(() => {
  return () => unsubscribe();
}, []);
```

### 2. `subscribeToUserFavorites(userId, callback)`

Subscribe to real-time updates for a user's favorite events.

```javascript
const unsubscribe = subscribeToUserFavorites('user123', (favoriteEvents) => {
  console.log('Favorites updated:', favoriteEvents);
  setFavorites(favoriteEvents);
});

// Clean up
unsubscribe();
```

**Note**: Automatically handles batching for users with >10 favorites (Firestore 'in' query limitation).

### 3. `subscribeToTrendingHashtags(callback, limit)`

Subscribe to real-time trending hashtag updates.

```javascript
const unsubscribe = subscribeToTrendingHashtags((hashtags) => {
  console.log('Trending hashtags:', hashtags);
  setTrendingHashtags(hashtags);
}, 15); // Get top 15 trending hashtags

// Clean up
unsubscribe();
```

---

## Batch Operations

Efficient bulk deletion operations using Firestore batch writes.

### 1. `deleteMultipleEvents(eventIds)`

Delete multiple events in a single batch operation (up to 500 per batch).

```javascript
const eventIds = ['event1', 'event2', 'event3'];
const result = await deleteMultipleEvents(eventIds);

console.log(result.successCount);      // Number of successfully deleted events
console.log(result.totalAttempted);    // Total number of events attempted
console.log(result.success);           // Boolean - true if all succeeded
console.log(result.errors);            // Array of error objects
```

### 2. `deleteMultiplePhotos(photoIds)`

Delete multiple photo documents from Firestore.

```javascript
const photoIds = ['photo1', 'photo2', 'photo3'];
const result = await deleteMultiplePhotos(photoIds);

console.log(`Deleted ${result.successCount} photos`);
```

**Important**: This only deletes Firestore documents. For complete deletion, also delete files from Firebase Storage using `deletePhotoFile()` from `photoService.js`.

---

## Search Functionality

Two search methods are provided: full-text search and hashtag search.

### 1. `searchEventsByText(searchTerm, options)`

Full-text search across event titles, descriptions, venues, and hashtags.

```javascript
// Basic search
const results = await searchEventsByText('afrobeats brunch');

// Advanced search with filters
const results = await searchEventsByText('afro', {
  category: 'brunch',
  limit: 20,
  sortBy: 'relevance',  // 'date', 'popularity', or 'relevance'
  startDate: new Date().toISOString()
});

console.log(`Found ${results.length} matching events`);
```

#### Search Scoring:
- **Title match**: 10 points (15 points for exact word match)
- **Venue match**: 7 points
- **Hashtag match**: 8 points (exact match only)
- **Description match**: 3 points

#### Options:

| Option | Type | Description |
|--------|------|-------------|
| `limit` | number | Max results (default: 50) |
| `category` | string | Filter by category |
| `startDate` | string | Filter by date |
| `sortBy` | string | 'date', 'popularity', or 'relevance' |

**Note**: This uses client-side filtering. For production apps with large datasets (>1000 events), consider using Algolia, ElasticSearch, or Typesense.

### 2. `searchEventsByHashtag(hashtag, options)`

Optimized hashtag search using Firestore's array-contains.

```javascript
// Basic hashtag search
const events = await searchEventsByHashtag('afrobeats');

// With filters
const events = await searchEventsByHashtag('#afrobeats', {
  category: 'nightlife',
  limit: 10,
  sortBy: 'popularity',
  startDate: new Date().toISOString()
});
```

---

## Firestore Indexes Setup

The enhanced queries require Firestore composite indexes. These are defined in `firestore.indexes.json`.

### Deploying Indexes

#### Option 1: Automatic (Recommended)

Run the queries in your app. Firestore will detect missing indexes and provide links in the console to create them automatically.

#### Option 2: Firebase CLI

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login:
```bash
firebase login
```

3. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### Required Indexes Summary

**Events Collection**:
- `category + date` (ASC/DESC)
- `category + favoritesCount + date`
- `promoterId + date` (ASC/DESC)
- `promoterId + favoritesCount + date`
- `favoritesCount + date` (ASC/DESC)
- `favoritesCount + createdAt` (DESC)
- `hashtags (array-contains) + date` (ASC/DESC)
- `hashtags (array-contains) + category + date`
- `hashtags (array-contains) + favoritesCount + date`

**Hashtags Collection**:
- `usageCount (DESC) + lastUsed (DESC)`

All indexes are documented in `firestore.indexes.json`.

---

## Testing

Comprehensive tests are available in `/src/pages/FirebaseTest.jsx`.

### Running Tests

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `/firebase-test` in your browser

3. Run tests:
   - **Run Enhanced Tests**: Tests all new features
   - **Individual Tests**: Test specific features separately

### Test Coverage

✅ Advanced compound queries
✅ Pagination with cursors
✅ Popularity and trending sorting
✅ Real-time event listeners
✅ Real-time favorites listeners
✅ Real-time trending hashtags
✅ Batch event deletion
✅ Batch photo deletion
✅ Full-text search
✅ Hashtag search

---

## Performance Optimization

### Best Practices

1. **Use pagination** for large result sets:
   ```javascript
   const result = await getEvents({ limit: 20 });
   // Load more when needed
   const nextPage = await getEvents({
     limit: 20,
     startAfterDoc: result.lastDoc
   });
   ```

2. **Unsubscribe from listeners** when components unmount:
   ```javascript
   useEffect(() => {
     const unsubscribe = subscribeToEvents({...}, callback);
     return () => unsubscribe();
   }, []);
   ```

3. **Use specific filters** to reduce data fetched:
   ```javascript
   // Good: Specific filters
   getEvents({ category: 'nightlife', startDate: today, limit: 20 })

   // Avoid: Fetching all events
   getEvents({ limit: 1000 })
   ```

4. **Batch operations** for deleting multiple items:
   ```javascript
   // Good: Single batch operation
   deleteMultipleEvents(eventIds);

   // Avoid: Individual deletions
   eventIds.forEach(id => deleteEvent(id));
   ```

5. **Use hashtag search** instead of text search when possible:
   ```javascript
   // More efficient
   searchEventsByHashtag('afrobeats');

   // Less efficient (client-side filtering)
   searchEventsByText('afrobeats');
   ```

### Cost Optimization

- **Firestore charges per read**: Use pagination to avoid reading large datasets
- **Index writes are free**: Don't worry about the number of indexes
- **Real-time listeners**: More cost-effective than polling with `getDocs()`
- **Batch operations**: More cost-effective than individual operations

---

## Migration Guide

If you're upgrading from the basic eventService:

### Breaking Changes

The `getEvents()` function now returns an object instead of an array:

**Before:**
```javascript
const events = await getEvents({ category: 'nightlife' });
console.log(events[0]); // First event
```

**After:**
```javascript
const result = await getEvents({ category: 'nightlife' });
console.log(result.events[0]);  // First event
console.log(result.hasMore);    // Pagination info
console.log(result.lastDoc);    // For next page
```

### Backward Compatibility

To maintain backward compatibility in existing code:

```javascript
const result = await getEvents({ category: 'nightlife' });
const events = result.events || result; // Works with both old and new versions
```

---

## Support and Contributing

For issues, questions, or feature requests, please open an issue in the repository.

### Roadmap

Future enhancements being considered:
- [ ] Server-side search with Algolia integration
- [ ] Advanced analytics queries
- [ ] Event recommendation engine
- [ ] Geolocation-based queries
- [ ] Caching layer for improved performance

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 2025
**Version**: 2.0.0
