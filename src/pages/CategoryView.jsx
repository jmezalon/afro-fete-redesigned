import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import EventCard from '../components/EventCard';
import Newsletter from '../components/Newsletter';
import { getEvents, searchEventsByHashtag } from '../services/eventService';
import { getTrendingHashtags } from '../services/hashtagService';
import { useAuth } from '../context/AuthContext';
import { EVENT_CATEGORIES } from '../data/eventCategories';

const CategoryView = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleFavorite } = useAuth();

  // State
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [activeTimeFilter, setActiveTimeFilter] = useState('TODAY');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [eventsToShow, setEventsToShow] = useState(6);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find current category
  const currentCategory = EVENT_CATEGORIES.find(
    cat => cat.id === categoryName || cat.name === categoryName
  );

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

  // Fetch events based on category and filters
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentCategory) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const dateRange = getDateRange(activeTimeFilter);

        // If there's a search query (hashtag), use it; otherwise filter by category
        let result;
        if (searchQuery.trim()) {
          const hashtag = searchQuery.startsWith('#') ? searchQuery.slice(1) : searchQuery;
          result = await searchEventsByHashtag(hashtag, {
            category: currentCategory.name,
            ...dateRange,
            limit: 50,
            sortBy: 'date',
          });
          setEvents(result);
        } else {
          result = await getEvents({
            category: currentCategory.name,
            ...dateRange,
            sortBy: 'date',
            sortOrder: 'asc',
            limit: 50,
          });
          const fetchedEvents = result.events || result;
          setEvents(fetchedEvents);
        }

        setDisplayedEvents((result.events || result).slice(0, eventsToShow));
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setDisplayedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [categoryName, activeTimeFilter, currentCategory, navigate]);

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

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // Reset to category view
      setLoading(true);
      try {
        const dateRange = getDateRange(activeTimeFilter);
        const result = await getEvents({
          category: currentCategory.name,
          ...dateRange,
          sortBy: 'date',
          sortOrder: 'asc',
          limit: 50,
        });
        const fetchedEvents = result.events || result;
        setEvents(fetchedEvents);
        setDisplayedEvents(fetchedEvents.slice(0, 6));
        setEventsToShow(6);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Search with hashtag
    setLoading(true);
    try {
      const dateRange = getDateRange(activeTimeFilter);
      const hashtag = query.startsWith('#') ? query.slice(1) : query;
      const results = await searchEventsByHashtag(hashtag, {
        category: currentCategory.name,
        ...dateRange,
        limit: 50,
        sortBy: 'date',
      });
      setEvents(results);
      setDisplayedEvents(results.slice(0, 6));
      setEventsToShow(6);
    } catch (error) {
      console.error('Error searching by hashtag:', error);
      setEvents([]);
      setDisplayedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`);
    setSidebarOpen(false);
  };

  // Handle hashtag click
  const handleHashtagClick = async (hashtag) => {
    const normalizedHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
    setSearchQuery(normalizedHashtag);
    await handleSearch(normalizedHashtag);
  };

  // Handle time filter change
  const handleTimeFilterChange = (filter) => {
    setActiveTimeFilter(filter);
    setEventsToShow(6);
  };

  // Handle show more
  const handleShowMore = () => {
    setEventsToShow(prev => prev + 6);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (eventId) => {
    if (!user) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }

    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Check if event is favorited
  const isEventFavorited = (eventId) => {
    return user?.favoriteEvents?.includes(eventId) || false;
  };

  if (!currentCategory) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Toggle category menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 lg:w-1/5 bg-gray-50 p-6 overflow-y-auto transition-transform duration-300 z-40 lg:z-0`}
          style={{ top: '80px' }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 lg:hidden">Categories</h3>
          <div className="space-y-4">
            {EVENT_CATEGORIES.map((category) => {
              const isActive = category.id === currentCategory.id;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl ${
                    isActive ? 'ring-4 ring-[#FF6B6B] ring-offset-2' : ''
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.displayName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <h4 className="text-white text-xl font-bold mb-1">
                      {category.displayName}
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      {category.hashtag}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:w-4/5">
          {/* Category Header */}
          <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                <span className="text-gray-400">#</span>
                <span className="italic">{currentCategory.name}</span>
              </h1>

              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by hashtag... ex. #dayparty"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Time Filter Tabs */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-center overflow-x-auto">
                <div className="inline-flex gap-4 bg-gray-50 rounded-full p-2">
                  {timeFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleTimeFilterChange(filter)}
                      className={`px-6 py-2.5 text-sm sm:text-base font-semibold whitespace-nowrap rounded-full transition-all duration-200 ${
                        activeTimeFilter === filter
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-md'
                          : 'text-gray-600 hover:text-[#FF6B6B] hover:bg-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Events Grid */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg aspect-[4/3] animate-pulse"></div>
                  ))}
                </div>
              ) : displayedEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="mt-12 text-center">
                      <button
                        onClick={handleShowMore}
                        className="px-10 py-4 bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full font-semibold hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white hover:border-transparent transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        Show More Events
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                    <p className="text-gray-600 text-lg mb-6">
                      No events found {searchQuery ? `for "${searchQuery}"` : ''}.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        handleSearch('');
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Clear search
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
          <section className="pt-16 pb-0 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
                Trending Hashtags
              </h2>

              <div className="flex flex-wrap justify-center gap-3 pb-16">
                {trendingHashtags.map((hashtag) => (
                  <button
                    key={hashtag.id}
                    onClick={() => handleHashtagClick(hashtag.name)}
                    className="bg-white hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] text-[#FF6B6B] hover:text-white px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-[#FF6B6B] hover:border-transparent"
                  >
                    #{hashtag.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Newsletter */}
      <Newsletter />

      <Footer />
    </div>
  );
};

export default CategoryView;
