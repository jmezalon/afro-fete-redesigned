import React, { useState } from 'react';
import { signUpUser, signInUser, signOutUser } from '../services/authService';
import { createEvent, getEvents } from '../services/eventService';
import { getTrendingHashtags, updateHashtagCount } from '../services/hashtagService';
import { auth } from '../config/firebase';

function FirebaseTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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

        // Test getting events
        addResult('Event Service', 'testing', 'Testing get events...');
        const events = await getEvents({ category: 'nightlife', limit: 5 });
        addResult(
          'Event Service - Get Events',
          'success',
          `Retrieved ${events.length} event(s)`
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

  const runAllTests = async () => {
    setTestResults([]);
    await testFirebaseConnection();
    await testAuthService();
    await testEventService();
    await testHashtagService();
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Run All Tests
            </button>
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Test Connection
            </button>
            <button
              onClick={testAuthService}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              Test Auth
            </button>
            <button
              onClick={testEventService}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
            >
              Test Events
            </button>
            <button
              onClick={testHashtagService}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-gray-400"
            >
              Test Hashtags
            </button>
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
            >
              Clear Results
            </button>
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
