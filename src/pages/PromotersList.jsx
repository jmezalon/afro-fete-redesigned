import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Calendar, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import { getAllPromoters } from '../services/authService';
import { getEvents } from '../services/eventService';

const PromotersList = () => {
  const navigate = useNavigate();
  const [promoters, setPromoters] = useState([]);
  const [promotersWithEventCounts, setPromotersWithEventCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPromotersAndEvents = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all promoters
        const promotersData = await getAllPromoters();

        // Fetch all events to count events per promoter
        const eventsResult = await getEvents({ limit: 1000 });
        const allEvents = eventsResult.events || eventsResult;

        // Count events per promoter
        // Handle both 'promoterId' and 'createdBy' field names for backwards compatibility
        const eventCounts = {};
        allEvents.forEach((event) => {
          const promoterId = event.promoterId || event.createdBy;
          if (promoterId) {
            eventCounts[promoterId] = (eventCounts[promoterId] || 0) + 1;
          }
        });

        // Add event counts to promoters
        const promotersWithCounts = promotersData.map((promoter) => ({
          ...promoter,
          eventCount: eventCounts[promoter.uid] || 0,
        }));

        // Sort by event count (most active first)
        promotersWithCounts.sort((a, b) => b.eventCount - a.eventCount);

        setPromoters(promotersData);
        setPromotersWithEventCounts(promotersWithCounts);
      } catch (err) {
        console.error('Error fetching promoters:', err);
        setError('Failed to load promoters. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotersAndEvents();
  }, []);

  const getPromoterInitials = (promoter) => {
    if (promoter?.fullName) {
      const names = promoter.fullName.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return promoter?.username?.[0]?.toUpperCase() || 'P';
  };

  const handlePromoterClick = (promoterId) => {
    navigate(`/user/${promoterId}`);
  };

  // Filter promoters based on search query
  const filteredPromoters = promotersWithEventCounts.filter((promoter) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      promoter.fullName?.toLowerCase().includes(searchLower) ||
      promoter.username?.toLowerCase().includes(searchLower) ||
      promoter.bio?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B6B] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading promoters...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 rounded-2xl p-8 mb-6">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-xl font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Try Again
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

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover Promoters
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with the best event promoters in your area
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] mx-auto mb-12"></div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search promoters by name or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent shadow-sm text-lg"
              />
            </div>
          </div>

          {/* Results count */}
          <p className="text-gray-600 mb-8">
            {filteredPromoters.length} {filteredPromoters.length === 1 ? 'promoter' : 'promoters'} found
          </p>
        </div>
      </section>

      {/* Promoters Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {filteredPromoters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPromoters.map((promoter) => (
                <article
                  key={promoter.uid}
                  onClick={() => handlePromoterClick(promoter.uid)}
                  className="bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden group"
                >
                  {/* Card Header with Gradient Background */}
                  <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] p-8 text-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    {/* Profile Picture */}
                    <div className="relative z-10 w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-[#FF6B6B] text-3xl font-bold shadow-xl mb-4 overflow-hidden">
                      {promoter.profilePhoto ? (
                        <img
                          src={promoter.profilePhoto}
                          alt={promoter.fullName || promoter.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getPromoterInitials(promoter)
                      )}
                    </div>

                    {/* Promoter Name */}
                    <h3 className="relative z-10 text-2xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                      {promoter.fullName || promoter.username}
                    </h3>

                    {/* Username */}
                    {promoter.fullName && promoter.username && (
                      <p className="relative z-10 text-white/90 text-sm">@{promoter.username}</p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Bio */}
                    {promoter.bio && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3 min-h-[3.6rem]">
                        {promoter.bio}
                      </p>
                    )}

                    {/* Event Count */}
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <Calendar className="w-4 h-4 text-[#FF6B6B]" />
                      <span className="text-sm font-medium">
                        {promoter.eventCount} {promoter.eventCount === 1 ? 'event' : 'events'}
                      </span>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      {promoter.instagramHandle && (
                        <a
                          href={`https://instagram.com/${promoter.instagramHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-purple-600 transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                          <span className="hidden sm:inline">Instagram</span>
                        </a>
                      )}
                      {promoter.twitterHandle && (
                        <a
                          href={`https://x.com/${promoter.twitterHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-black transition-colors"
                          title="Twitter/X"
                        >
                          <Twitter className="w-4 h-4" />
                          <span className="hidden sm:inline">Twitter</span>
                        </a>
                      )}
                      {!promoter.instagramHandle && !promoter.twitterHandle && (
                        <span className="text-xs text-gray-400">No social links</span>
                      )}
                    </div>

                    {/* View Profile Button */}
                    <button
                      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-xl font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg transform group-hover:scale-105"
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchQuery
                    ? `No promoters found matching "${searchQuery}"`
                    : 'No promoters available at the moment.'}
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

export default PromotersList;
