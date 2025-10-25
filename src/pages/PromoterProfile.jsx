import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Instagram, Twitter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/eventService';
import { getCurrentUserData } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const PromoterProfile = () => {
  const { promoterId } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();

  const [promoter, setPromoter] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const eventsPerPage = 6;

  useEffect(() => {
    const fetchPromoterData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch promoter profile data
        const promoterData = await getCurrentUserData(promoterId);

        // Verify this is actually a promoter
        if (promoterData.userType !== 'promoter') {
          setError('This user is not a promoter.');
          setLoading(false);
          return;
        }

        setPromoter(promoterData);

        // Fetch promoter's events
        // Fetch all events and filter manually to handle both 'promoterId' and 'createdBy' fields
        const result = await getEvents({
          limit: 1000,
          sortBy: 'date',
          sortOrder: 'asc'
        });

        const allEvents = result.events || result;
        // Filter events by this promoter (handle both field names)
        const eventsList = allEvents.filter(event => {
          const eventPromoterId = event.promoterId || event.createdBy;
          return eventPromoterId === promoterId;
        });

        setEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promoter data:', err);
        setError('Failed to load promoter profile. Please try again later.');
        setLoading(false);
      }
    };

    if (promoterId) {
      fetchPromoterData();
    }
  }, [promoterId]);

  const handleFavoriteToggle = async (eventId) => {
    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getPromoterInitials = () => {
    if (promoter?.fullName) {
      const names = promoter.fullName.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return promoter?.username?.[0]?.toUpperCase() || 'P';
  };

  const displayedEvents = events.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  const totalPages = Math.ceil(events.length / eventsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B6B] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading promoter profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !promoter) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 rounded-2xl p-8 mb-6">
              <p className="text-red-600 text-lg mb-4">{error || 'Promoter not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-xl font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FF6B6B] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Promoter Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            {/* Profile Picture */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl mb-6 overflow-hidden">
              {promoter.profilePhoto ? (
                <img
                  src={promoter.profilePhoto}
                  alt={promoter.fullName || promoter.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                getPromoterInitials()
              )}
            </div>

            {/* Promoter Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {promoter.fullName || promoter.username}
            </h1>

            {/* Username */}
            {promoter.fullName && promoter.username && (
              <p className="text-gray-600 text-lg mb-4">@{promoter.username}</p>
            )}

            {/* Promoter Badge */}
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full text-sm font-semibold mb-6">
              Promoter
            </span>

            {/* Bio */}
            {promoter.bio && (
              <p className="text-gray-700 text-lg max-w-2xl mb-6">
                {promoter.bio}
              </p>
            )}

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              {promoter.instagramHandle && (
                <a
                  href={`https://instagram.com/${promoter.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Instagram className="w-5 h-5" />
                  <span>@{promoter.instagramHandle.replace('@', '')}</span>
                </a>
              )}
              {promoter.twitterHandle && (
                <a
                  href={`https://x.com/${promoter.twitterHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Twitter className="w-5 h-5" />
                  <span>@{promoter.twitterHandle.replace('@', '')}</span>
                </a>
              )}
            </div>
          </div>

          <div className="w-32 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] mx-auto"></div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            Events by {promoter.fullName || promoter.username}
          </h2>
          <p className="text-gray-600 text-center mb-12">
            {events.length} {events.length === 1 ? 'event' : 'events'} total
          </p>

          {events.length > 0 ? (
            <>
              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorited={user?.favoriteEvents?.includes(event.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    currentUserId={user?.uid}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  <span className="text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-6 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-lg font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <p className="text-gray-600 text-lg">
                  This promoter hasn't posted any events yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PromoterProfile;
