import React, { useState, useEffect } from 'react';
import { signUpUser, signInUser, signOutUser } from '../services/authService';
import {
  createEvent,
  getEvents,
  subscribeToEvents,
  subscribeToUserFavorites,
  subscribeToTrendingHashtags,
  deleteMultipleEvents,
  deleteMultiplePhotos,
  searchEventsByText,
  searchEventsByHashtag,
} from '../services/eventService';
import { getTrendingHashtags, updateHashtagCount } from '../services/hashtagService';
import { auth } from '../config/firebase';

function FirebaseTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [createdEventIds, setCreatedEventIds] = useState([]);

  const addResult = (test, status, message) => {
    setTestResults((prev) => [
      ...prev,
      { test, status, message, timestamp: new Date().toISOString() },
    ]);
  };

  const testFirebaseConnection = async () => {
    try {
      setLoading(true);
      addResult('Firebase Config', 'testing', 'Testing Firebase initialization...');

      // Check if Firebase is initialized
      if (auth) {
        addResult('Firebase Config', 'success', 'Firebase initialized successfully');
      } else {
        addResult('Firebase Config', 'error', 'Firebase not initialized');
      }
    } catch (error) {
      addResult('Firebase Config', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthService = async () => {
    try {
      setLoading(true);
      const testEmail = `test${Date.now()}@afrofete.com`;
      const testPassword = 'TestPassword123!';

      addResult('Auth Service', 'testing', 'Testing user signup...');

      // Test signup
      const newUser = await signUpUser(testEmail, testPassword, {
        name: 'Test User',
        role: 'user',
      });

      if (newUser && newUser.uid) {
        addResult('Auth Service - Signup', 'success', `User created: ${newUser.email}`);
        setCurrentUser(newUser);

        // Test sign out
        addResult('Auth Service', 'testing', 'Testing sign out...');
        await signOutUser();
        addResult('Auth Service - Sign Out', 'success', 'User signed out successfully');

        // Test sign in
        addResult('Auth Service', 'testing', 'Testing sign in...');
        const signedInUser = await signInUser(testEmail, testPassword);
        addResult('Auth Service - Sign In', 'success', `User signed in: ${signedInUser.email}`);
        setCurrentUser(signedInUser);
      } else {
        addResult('Auth Service - Signup', 'error', 'User creation failed');
      }
    } catch (error) {
      addResult('Auth Service', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testEventService = async () => {
    try {
      setLoading(true);

      if (!currentUser) {
        addResult('Event Service', 'error', 'No user logged in. Run Auth test first.');
        setLoading(false);
        return;
      }

      addResult('Event Service', 'testing', 'Testing event creation...');

      // Create a test event
      const testEvent = await createEvent(
        {
          title: 'Test Afro Beats Night',
          description: 'A test event for Firebase testing',
          category: 'nightlife',
          date: new Date().toISOString(),
          startTime: '9:00 PM',
          endTime: '2:00 AM',
          venue: 'Test Venue',
          location: { city: 'Test City', address: '123 Test St' },
          price: 25,
          hashtags: ['afrobeats', 'nightlife', 'test'],
        },
        currentUser.uid
      );

      if (testEvent && testEvent.id) {
        addResult('Event Service - Create', 'success', `Event created: ${testEvent.title}`);
        setCreatedEventIds((prev) => [...prev, testEvent.id]);

        // Test getting events
        addResult('Event Service', 'testing', 'Testing get events...');
        const result = await getEvents({ category: 'nightlife', limit: 5 });
        addResult(
          'Event Service - Get Events',
          'success',
          `Retrieved ${result.events?.length || result.length} event(s). HasMore: ${result.hasMore || 'N/A'}`
        );
      } else {
        addResult('Event Service - Create', 'error', 'Event creation failed');
      }
    } catch (error) {
      addResult('Event Service', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testHashtagService = async () => {
    try {
      setLoading(true);
      addResult('Hashtag Service', 'testing', 'Testing hashtag tracking...');

      // Update hashtag count
      await updateHashtagCount('afrobeats');
      await updateHashtagCount('nightlife');
      await updateHashtagCount('test');

      addResult('Hashtag Service - Update', 'success', 'Hashtag counts updated');

      // Get trending hashtags
      const trending = await getTrendingHashtags(5);
      addResult(
        'Hashtag Service - Trending',
        'success',
        `Retrieved ${trending.length} trending hashtag(s)`
      );
    } catch (error) {
      addResult('Hashtag Service', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAdvancedQueries = async () => {
    try {
      setLoading(true);

      if (!currentUser) {
        addResult('Advanced Queries', 'error', 'No user logged in. Run Auth test first.');
        setLoading(false);
        return;
      }

      // Test 1: Compound query with multiple filters
      addResult('Advanced Queries', 'testing', 'Testing compound query (category + date + sorting)...');
      const result1 = await getEvents({
        category: 'nightlife',
        startDate: new Date().toISOString(),
        sortBy: 'date',
        sortOrder: 'asc',
        limit: 10,
      });
      addResult(
        'Advanced Queries - Compound',
        'success',
        `Found ${result1.events.length} nightlife events. HasMore: ${result1.hasMore}`
      );

      // Test 2: Popularity sorting
      addResult('Advanced Queries', 'testing', 'Testing popularity sorting...');
      const result2 = await getEvents({
        sortBy: 'popularity',
        limit: 5,
      });
      addResult(
        'Advanced Queries - Popularity',
        'success',
        `Retrieved ${result2.events.length} popular events`
      );

      // Test 3: Pagination
      addResult('Advanced Queries', 'testing', 'Testing pagination...');
      const page1 = await getEvents({ limit: 3 });
      if (page1.lastDoc) {
        const page2 = await getEvents({ limit: 3, startAfterDoc: page1.lastDoc });
        addResult(
          'Advanced Queries - Pagination',
          'success',
          `Page 1: ${page1.events.length} events, Page 2: ${page2.events.length} events`
        );
      } else {
        addResult(
          'Advanced Queries - Pagination',
          'success',
          'Not enough events for pagination test'
        );
      }
    } catch (error) {
      addResult('Advanced Queries', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testRealtimeListeners = async () => {
    try {
      setLoading(true);

      addResult('Real-time Listeners', 'testing', 'Testing subscribeToEvents...');

      // Test subscribeToEvents
      let eventUpdateCount = 0;
      const unsubscribe = subscribeToEvents(
        { category: 'nightlife', limit: 5 },
        (events) => {
          eventUpdateCount++;
          if (eventUpdateCount === 1) {
            addResult(
              'Real-time Listeners - Events',
              'success',
              `Received ${events.length} events in real-time (update #${eventUpdateCount})`
            );
          }
        }
      );

      // Unsubscribe after 2 seconds
      setTimeout(() => {
        unsubscribe();
        addResult('Real-time Listeners', 'success', 'Unsubscribed from events listener');
      }, 2000);

      // Test subscribeToTrendingHashtags
      addResult('Real-time Listeners', 'testing', 'Testing subscribeToTrendingHashtags...');
      const unsubscribeHashtags = subscribeToTrendingHashtags((hashtags) => {
        addResult(
          'Real-time Listeners - Hashtags',
          'success',
          `Received ${hashtags.length} trending hashtags in real-time`
        );
        unsubscribeHashtags();
      }, 5);

      // Test subscribeToUserFavorites
      if (currentUser) {
        addResult('Real-time Listeners', 'testing', 'Testing subscribeToUserFavorites...');
        const unsubscribeFavorites = subscribeToUserFavorites(currentUser.uid, (favorites) => {
          addResult(
            'Real-time Listeners - Favorites',
            'success',
            `Received ${favorites.length} favorite events in real-time`
          );
          unsubscribeFavorites();
        });
      }
    } catch (error) {
      addResult('Real-time Listeners', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testBatchOperations = async () => {
    try {
      setLoading(true);

      if (!currentUser) {
        addResult('Batch Operations', 'error', 'No user logged in. Run Auth test first.');
        setLoading(false);
        return;
      }

      // Create multiple events for batch deletion testing
      addResult('Batch Operations', 'testing', 'Creating multiple test events...');
      const eventIds = [];

      for (let i = 0; i < 3; i++) {
        const event = await createEvent(
          {
            title: `Batch Test Event ${i + 1}`,
            description: 'Event for batch deletion test',
            category: 'nightlife',
            date: new Date().toISOString(),
            startTime: '9:00 PM',
            endTime: '2:00 AM',
            venue: 'Test Venue',
            hashtags: ['test', 'batch'],
            price: 20,
          },
          currentUser.uid
        );
        eventIds.push(event.id);
      }

      addResult('Batch Operations - Create', 'success', `Created ${eventIds.length} test events`);

      // Test batch deletion
      addResult('Batch Operations', 'testing', 'Testing deleteMultipleEvents...');
      const deleteResult = await deleteMultipleEvents(eventIds);

      if (deleteResult.success) {
        addResult(
          'Batch Operations - Delete Events',
          'success',
          `Deleted ${deleteResult.successCount}/${deleteResult.totalAttempted} events`
        );
      } else {
        addResult(
          'Batch Operations - Delete Events',
          'error',
          `Only deleted ${deleteResult.successCount}/${deleteResult.totalAttempted} events. Errors: ${deleteResult.errors.length}`
        );
      }

      // Test batch photo deletion (skip if no photos, as it requires non-empty array)
      addResult('Batch Operations', 'testing', 'Testing deleteMultiplePhotos validation...');
      try {
        await deleteMultiplePhotos([]);
        addResult(
          'Batch Operations - Delete Photos',
          'error',
          'Should have thrown error for empty array'
        );
      } catch (error) {
        if (error.message.includes('non-empty array')) {
          addResult(
            'Batch Operations - Delete Photos',
            'success',
            'Validation works: correctly rejects empty arrays'
          );
        } else {
          addResult(
            'Batch Operations - Delete Photos',
            'error',
            error.message
          );
        }
      }
    } catch (error) {
      addResult('Batch Operations', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSearchFunctionality = async () => {
    try {
      setLoading(true);

      // Test text search
      addResult('Search', 'testing', 'Testing searchEventsByText...');
      const textResults = await searchEventsByText('afro', {
        limit: 10,
        sortBy: 'relevance',
      });
      addResult(
        'Search - Text Search',
        'success',
        `Found ${textResults.length} events matching "afro"`
      );

      // Test hashtag search
      addResult('Search', 'testing', 'Testing searchEventsByHashtag...');
      const hashtagResults = await searchEventsByHashtag('afrobeats', {
        limit: 10,
        sortBy: 'date',
      });
      addResult(
        'Search - Hashtag Search',
        'success',
        `Found ${hashtagResults.length} events with #afrobeats`
      );

      // Test search with filters
      addResult('Search', 'testing', 'Testing search with category filter...');
      const filteredResults = await searchEventsByText('night', {
        category: 'nightlife',
        limit: 5,
      });
      addResult(
        'Search - Filtered Search',
        'success',
        `Found ${filteredResults.length} nightlife events matching "night"`
      );
    } catch (error) {
      addResult('Search', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testFirebaseConnection();
    await testAuthService();
    await testEventService();
    await testHashtagService();
  };

  const runEnhancedTests = async () => {
    setTestResults([]);
    await testFirebaseConnection();
    await testAuthService();
    await testAdvancedQueries();
    await testRealtimeListeners();
    await testSearchFunctionality();
    await testBatchOperations();
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Firebase Service Tests</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Run Basic Tests
            </button>
            <button
              onClick={runEnhancedTests}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Run Enhanced Tests
            </button>
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              Clear Results
            </button>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Individual Tests:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testFirebaseConnection}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Connection
              </button>
              <button
                onClick={testAuthService}
                disabled={loading}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
              >
                Auth
              </button>
              <button
                onClick={testEventService}
                disabled={loading}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
              >
                Events
              </button>
              <button
                onClick={testHashtagService}
                disabled={loading}
                className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-gray-400"
              >
                Hashtags
              </button>
              <button
                onClick={testAdvancedQueries}
                disabled={loading}
                className="px-3 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-400"
              >
                Advanced Queries
              </button>
              <button
                onClick={testRealtimeListeners}
                disabled={loading}
                className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-400"
              >
                Real-time Listeners
              </button>
              <button
                onClick={testSearchFunctionality}
                disabled={loading}
                className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 disabled:bg-gray-400"
              >
                Search
              </button>
              <button
                onClick={testBatchOperations}
                disabled={loading}
                className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700 disabled:bg-gray-400"
              >
                Batch Ops
              </button>
            </div>
          </div>
          {currentUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-900">
                Current User: <strong>{currentUser.email}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {testResults.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">
              No tests run yet. Click a test button to begin.
            </p>
          )}
          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded border-l-4 ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-500'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{result.test}</h3>
                      <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                    </div>
                    <span
                      className={`ml-4 px-2 py-1 text-xs font-medium rounded ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FirebaseTest;
