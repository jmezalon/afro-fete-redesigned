import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Instagram, Twitter, Camera } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/eventService';
import { getUserPhotos } from '../services/photoService';
import { getCurrentUserData } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, toggleFavorite } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentEventsPage, setCurrentEventsPage] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const eventsPerPage = 6;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch user profile data
        const userData = await getCurrentUserData(userId);
        setProfileUser(userData);

        // Fetch user's photos
        const userPhotos = await getUserPhotos(userId);
        setPhotos(userPhotos);

        // If user is a promoter, fetch their events
        if (userData.userType === 'promoter') {
          const result = await getEvents({
            limit: 1000,
            sortBy: 'date',
            sortOrder: 'asc'
          });

          const allEvents = result.events || result;
          // Filter events by this user (handle both field names)
          const eventsList = allEvents.filter(event => {
            const eventPromoterId = event.promoterId || event.createdBy;
            return eventPromoterId === userId;
          });

          setEvents(eventsList);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again later.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleFavoriteToggle = async (eventId) => {
    try {
      await toggleFavorite(eventId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getUserInitials = () => {
    if (profileUser?.fullName) {
      const names = profileUser.fullName.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return profileUser?.username?.[0]?.toUpperCase() || 'U';
  };

  const displayedEvents = events.slice(
    currentEventsPage * eventsPerPage,
    (currentEventsPage + 1) * eventsPerPage
  );

  const totalEventsPages = Math.ceil(events.length / eventsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B6B] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 rounded-2xl p-8 mb-6">
              <p className="text-red-600 text-lg mb-4">{error || 'User not found'}</p>
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

      {/* User Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            {/* Profile Picture */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl mb-6 overflow-hidden">
              {profileUser.profilePhoto ? (
                <img
                  src={profileUser.profilePhoto}
                  alt={profileUser.fullName || profileUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                getUserInitials()
              )}
            </div>

            {/* User Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {profileUser.fullName || profileUser.username}
            </h1>

            {/* Username */}
            {profileUser.fullName && profileUser.username && (
              <p className="text-gray-600 text-lg mb-4">@{profileUser.username}</p>
            )}

            {/* User Type Badge */}
            {profileUser.userType === 'promoter' && (
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full text-sm font-semibold mb-6">
                Promoter
              </span>
            )}

            {/* Bio */}
            {profileUser.bio && (
              <p className="text-gray-700 text-lg max-w-2xl mb-6">
                {profileUser.bio}
              </p>
            )}

            {/* Social Media Links */}
            {(profileUser.instagramHandle || profileUser.twitterHandle) && (
              <div className="flex items-center gap-4">
                {profileUser.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profileUser.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Instagram className="w-5 h-5" />
                    <span>@{profileUser.instagramHandle.replace('@', '')}</span>
                  </a>
                )}
                {profileUser.twitterHandle && (
                  <a
                    href={`https://x.com/${profileUser.twitterHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>@{profileUser.twitterHandle.replace('@', '')}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="w-32 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] mx-auto"></div>
        </div>
      </section>

      {/* Photos Section */}
      {photos.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
              Photos by {profileUser.fullName || profileUser.username}
            </h2>
            <p className="text-gray-600 text-center mb-12">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} posted
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-200"
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || 'User photo'}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Section (Promoters Only) */}
      {profileUser.userType === 'promoter' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
              Events by {profileUser.fullName || profileUser.username}
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
                {totalEventsPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentEventsPage(prev => Math.max(0, prev - 1))}
                      disabled={currentEventsPage === 0}
                      className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>

                    <span className="text-gray-600">
                      Page {currentEventsPage + 1} of {totalEventsPages}
                    </span>

                    <button
                      onClick={() => setCurrentEventsPage(prev => Math.min(totalEventsPages - 1, prev + 1))}
                      disabled={currentEventsPage === totalEventsPages - 1}
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
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="w-full h-auto"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                ×
              </button>
            </div>
            {selectedPhoto.caption && (
              <div className="p-6">
                <p className="text-gray-900 text-lg font-semibold mb-2">
                  {selectedPhoto.caption}
                </p>
                <p className="text-gray-600 text-sm">
                  {new Date(selectedPhoto.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserProfile;
