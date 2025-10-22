import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';
import { getEvents, subscribeToEvents, searchEventsByHashtag } from '../services/eventService';
import { getTrendingHashtags } from '../services/hashtagService';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();
  const eventsRef = useRef(null);

  // State
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState('TODAY');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eventsToShow, setEventsToShow] = useState(6);

  // Categories matching the mockup
  const categories = [
    { name: 'Brunch', hashtag: '#brunch', imageUrl: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=500' },
    { name: 'Festivals', hashtag: '#festivals', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500' },
    { name: 'Afterwork', hashtag: '#afterwork', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500' },
    { name: 'Day Party', hashtag: '#dayparty', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500' },
    { name: 'Nightlife', hashtag: '#nightlife', imageUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=500' },
    { name: 'Arts', hashtag: '#arts', imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500' },
    { name: 'Concerts', hashtag: '#concerts', imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500' },
    { name: 'Boat Rides', hashtag: '#boatrides', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500' },
  ];

  // Time filter tabs
  const timeFilters = ['TODAY', 'TOMORROW', 'THIS WEEKEND', 'THIS MONTH'];

  // Calculate date ranges for filters
  const getDateRange = (filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (filter) {
      case 'TODAY':
        return { startDate: today.toISOString(), endDate: tomorrow.toISOString() };
      case 'TOMORROW':
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return { startDate: tomorrow.toISOString(), endDate: dayAfterTomorrow.toISOString() };
      case 'THIS WEEKEND':
        return { startDate: today.toISOString(), endDate: endOfWeek.toISOString() };
      case 'THIS MONTH':
        return { startDate: today.toISOString(), endDate: endOfMonth.toISOString() };
      default:
        return { startDate: today.toISOString() };
    }
  };

  // Fetch events based on filters
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const dateRange = getDateRange(activeTimeFilter);
        const result = await getEvents({
          ...dateRange,
          category: selectedCategory,
          sortBy: 'date',
          sortOrder: 'asc',
          limit: 50, // Fetch more for filtering
        });

        const fetchedEvents = result.events || result;
        setEvents(fetchedEvents);
        setDisplayedEvents(fetchedEvents.slice(0, eventsToShow));
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setDisplayedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [activeTimeFilter, selectedCategory]);

  // Fetch trending hashtags
  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        const hashtags = await getTrendingHashtags(10);
        setTrendingHashtags(hashtags);
      } catch (error) {
        console.error('Error fetching trending hashtags:', error);
      }
    };

    fetchHashtags();
  }, []);

  // Update displayed events when eventsToShow changes
  useEffect(() => {
    setDisplayedEvents(events.slice(0, eventsToShow));
  }, [events, eventsToShow]);

  // Handle category click - navigate to category page
  const handleCategoryClick = (category) => {
    const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categorySlug}`);
  };

  // Handle hashtag click
  const handleHashtagClick = async (hashtag) => {
    setSelectedHashtag(hashtag);
    setSelectedCategory(null);
    setLoading(true);

    try {
      const results = await searchEventsByHashtag(hashtag, {
        limit: 50,
        sortBy: 'date',
      });
      setEvents(results);
      setDisplayedEvents(results.slice(0, 6));
      setEventsToShow(6);
      scrollToEvents();
    } catch (error) {
      console.error('Error searching by hashtag:', error);
      setEvents([]);
      setDisplayedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle time filter change
  const handleTimeFilterChange = (filter) => {
    setActiveTimeFilter(filter);
    setEventsToShow(6);
  };

  // Handle show more
  const handleShowMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setEventsToShow(prev => prev + 6);
      setLoadingMore(false);
    }, 300);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (eventId) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Scroll to events section
  const scrollToEvents = () => {
    setTimeout(() => {
      eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Check if event is favorited
  const isEventFavorited = (eventId) => {
    return user?.favoriteEvents?.includes(eventId) || false;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#FF6B6B]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FF8E8E]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Making memories is only a{' '}
                <span className="text-[#FF6B6B] italic">
                  #hashtag
                </span>{' '}
                away!
              </h1>
              <button
                onClick={scrollToEvents}
                className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white px-10 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Explore Events
              </button>
            </div>

            {/* Decorative Image Placeholders */}
            <div className="relative h-80 lg:h-96 hidden lg:block">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF8E8E]/20 rounded-2xl shadow-xl transform rotate-6 backdrop-blur-sm"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-[#FF8E8E]/20 to-[#FFB4B4]/20 rounded-2xl shadow-xl transform -rotate-3 backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Vibe Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-16">
            Choose Your Vibe!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.hashtag}
                category={category}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Event Browsing Section */}
      <section ref={eventsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Time Filter Tabs */}
          <div className="flex justify-center overflow-x-auto relative z-10">
            <div className="inline-flex gap-6 bg-white rounded-full p-2 mb-20" style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleTimeFilterChange(filter)}
                  className={`px-6 py-2.5 text-sm sm:text-base font-semibold whitespace-nowrap rounded-full transition-all duration-200 ${
                    activeTimeFilter === filter
                      ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#FF6B6B] hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || selectedHashtag) && (
            <div className="mb-8 flex flex-wrap items-center gap-3 justify-center bg-white rounded-full px-6 py-3 shadow-md w-fit mx-auto">
              <span className="text-sm font-medium text-gray-600">Filtering by:</span>
              {selectedCategory && (
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {selectedCategory}
                </span>
              )}
              {selectedHashtag && (
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {selectedHashtag}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedHashtag(null);
                }}
                className="text-sm text-[#FF6B6B] hover:text-[#ff5252] font-semibold ml-2"
              >
                Clear
              </button>
            </div>
          )}

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg aspect-[4/3] animate-pulse"></div>
              ))}
            </div>
          ) : displayedEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorited={isEventFavorited(event.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onHashtagClick={handleHashtagClick}
                    currentUserId={user?.uid}
                  />
                ))}
              </div>

              {/* Show More Button */}
              {eventsToShow < events.length && (
                <div className="mt-16 text-center">
                  <button
                    onClick={handleShowMore}
                    disabled={loadingMore}
                    className="px-10 py-4 bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full font-semibold hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white hover:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loadingMore ? 'Loading...' : 'Show More Events'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <p className="text-gray-600 text-lg mb-6">No events found for the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedHashtag(null);
                    setActiveTimeFilter('TODAY');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Trending Hashtags Section */}
      <section className="pt-20 pb-0 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-12">
            Trending Hashtags
          </h2>

          <div className="flex flex-wrap justify-center gap-4 pb-20">
            {trendingHashtags.map((hashtag) => (
              <button
                key={hashtag.id}
                onClick={() => handleHashtagClick(hashtag.name)}
                className="bg-white hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] text-[#FF6B6B] hover:text-white px-6 py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-[#FF6B6B] hover:border-transparent"
              >
                #{hashtag.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
    </div>
  );
};

export default Landing;
