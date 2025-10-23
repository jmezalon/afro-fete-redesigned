import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ExternalLink, Menu, X, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import HashtagFollowButton from '../components/HashtagFollowButton';
import { getEventById } from '../services/eventService';
import { getTrendingHashtags } from '../services/hashtagService';
import { useAuth } from '../context/AuthContext';
import { EVENT_CATEGORIES } from '../data/eventCategories';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleFavorite } = useAuth();

  // State
  const [event, setEvent] = useState(null);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Event not found');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

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

  // Handle category click
  const handleCategoryClick = (category) => {
    navigate(`/category/${category.id}`);
    setSidebarOpen(false);
  };

  // Handle hashtag click
  const handleHashtagClick = (hashtag) => {
    navigate(`/?hashtag=${encodeURIComponent(hashtag)}`);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }

    try {
      await toggleFavorite(eventId);
      // Re-fetch event to get updated favorite status
      const updatedEvent = await getEventById(eventId);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Check if event is favorited
  const isEventFavorited = () => {
    return user?.favoriteEvents?.includes(eventId) || false;
  };

  // Check if current user is the event creator
  const isOwnEvent = user?.uid && event?.promoterId === user.uid;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse event data
  const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
  const month = format(eventDate, 'MMM').toUpperCase();
  const day = format(eventDate, 'd');
  const fullDate = format(eventDate, 'EEEE, MMMM d, yyyy');

  const venueName = event.venueName || event.venue || '';
  const fullAddress = event.address?.street
    ? `${event.address.street}, ${event.address.city}, ${event.address.state} ${event.address.zip}`
    : event.address || '';
  const flyerImage = event.flyerUrl || event.imageUrl || '';
  const eventTitle = event.name || event.title || '';
  const description = event.description || '';

  // Find the category for the current event
  const eventCategory = EVENT_CATEGORIES.find(cat => cat.name === event.category);

  // Convert 24-hour time to 12-hour format with AM/PM
  // If time already includes AM/PM, return as-is
  const formatTime = (time) => {
    if (!time) return '';
    // Check if time already has AM/PM
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-72 lg:w-1/5 bg-gray-50 p-6 overflow-y-auto transition-transform duration-300 z-40 lg:z-0`}
          style={{ top: '80px' }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 lg:hidden">Categories</h3>
          <div className="space-y-4">
            {EVENT_CATEGORIES.map((category) => {
              const isActive = eventCategory && category.id === eventCategory.id;
              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative aspect-[3/1] lg:aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl ${
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
        <main className="flex-1 lg:w-4/5 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Event Flyer */}
            <div className="relative w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img
                src={flyerImage}
                alt={`${eventTitle} event flyer`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 relative">
              {/* Favorite Button (only show if not own event) */}
              {!isOwnEvent && (
                <button
                  onClick={handleFavoriteToggle}
                  className="absolute top-6 right-6 p-3 rounded-full bg-gray-50 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
                  aria-label={isEventFavorited() ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${
                      isEventFavorited()
                        ? 'fill-[#FF6B6B] stroke-[#FF6B6B]'
                        : 'stroke-gray-600 hover:stroke-[#FF6B6B]'
                    }`}
                  />
                </button>
              )}

              <div className="flex flex-col md:flex-row gap-8">
                {/* Date Display */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-[#FF6B6B] rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                    <span className="text-sm font-bold leading-none">{month}</span>
                    <span className="text-4xl font-bold leading-none mt-2">{day}</span>
                  </div>
                </div>

                {/* Event Information */}
                <div className="flex-1 pr-12">
                  {/* Event Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {eventTitle}
                  </h1>

                  {/* Venue Name */}
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{venueName}</p>
                      <p className="text-sm text-gray-600">{fullAddress}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#FF6B6B]" />
                    <p className="text-gray-700">{fullDate}</p>
                  </div>

                  {event.startTime && (
                    <div className="flex items-center gap-2 mb-6">
                      <Clock className="w-5 h-5 text-[#FF6B6B]" />
                      <p className="text-gray-700">
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {event.hashtags && event.hashtags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Hashtags</h3>
                      <div className="flex flex-wrap gap-3">
                        {event.hashtags.map((hashtag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-[#FF6B6B] rounded-full px-4 py-2"
                          >
                            <button
                              onClick={() => handleHashtagClick(hashtag)}
                              className="text-[#FF6B6B] hover:text-[#ff5252] hover:underline font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-1 rounded"
                            >
                              {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                            </button>
                            <div className="h-4 w-px bg-[#FF6B6B]"></div>
                            <HashtagFollowButton
                              hashtag={hashtag}
                              variant="minimal"
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Buy Tickets Button */}
                  {event.ticketLink && (
                    <a
                      href={event.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-bold text-lg hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>Buy Tickets</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}

                  {event.price !== undefined && event.price > 0 && (
                    <p className="text-center text-gray-600 mt-3">
                      Starting at ${event.price}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="max-w-4xl mx-auto w-full px-4 mb-12">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Trending Hashtags Section */}
          <section className="pt-12 pb-0 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Trending Hashtags
                </h2>
                <button
                  onClick={() => navigate('/hashtags')}
                  className="text-[#FF6B6B] hover:text-[#ff5252] font-semibold hover:underline transition-colors"
                >
                  Browse All
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pb-12">
                {trendingHashtags.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="flex items-center gap-3 bg-white border-2 border-[#FF6B6B] rounded-full px-5 py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    <button
                      onClick={() => handleHashtagClick(hashtag.name)}
                      className="text-[#FF6B6B] hover:text-[#ff5252] text-base font-bold hover:underline transition-colors"
                    >
                      #{hashtag.name}
                    </button>
                    <div className="h-4 w-px bg-[#FF6B6B]"></div>
                    <HashtagFollowButton
                      hashtag={hashtag.name}
                      variant="minimal"
                      size="sm"
                    />
                  </div>
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

export default EventDetail;
