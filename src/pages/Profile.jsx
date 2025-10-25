import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChevronLeft, ChevronRight, Trash2, X, Plus, Edit, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import EventCard from '../components/EventCard';
import ProfilePhotoUploadModal from '../components/ProfilePhotoUploadModal';
import { getEvents, deleteEvent } from '../services/eventService';
import { getUserPhotos, deletePhoto } from '../services/photoService';

const Profile = () => {
  const { user, updateProfile, toggleFavorite, followHashtag, unfollowHashtag } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [photosPosted, setPhotosPosted] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [favoritesPage, setFavoritesPage] = useState(0);
  const [myEventsPage, setMyEventsPage] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const favoritesPerPage = 3;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        password: '',
        confirmPassword: '',
      });

      // Fetch favorite events
      if (user.favoriteEvents && user.favoriteEvents.length > 0) {
        fetchFavoriteEvents();
      }

      // Fetch promoter's events
      if (user.userType === 'promoter') {
        fetchMyEvents();
      }

      // Fetch user's photos
      fetchMyPhotos();
    }
  }, [user, location.state]);

  const fetchFavoriteEvents = async () => {
    try {
      const result = await getEvents({ limit: 50 });
      const events = result.events || result;
      const favorites = events.filter(event => user?.favoriteEvents?.includes(event.id));
      setFavoriteEvents(favorites);
    } catch (error) {
      console.error('Error fetching favorite events:', error);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const result = await getEvents({ limit: 50 });
      const events = result.events || result;
      const myEventsList = events.filter(event => event.promoterId === user?.uid);
      setMyEvents(myEventsList);
    } catch (error) {
      console.error('Error fetching my events:', error);
    }
  };

  const fetchMyPhotos = async () => {
    try {
      const photos = await getUserPhotos(user?.uid);
      setPhotosPosted(photos);
    } catch (error) {
      console.error('Error fetching my photos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (saveError) {
      setSaveError('');
    }
  };

  const handleSave = async () => {
    // Clear previous errors
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Validate passwords match if user is trying to change password (and fields are not empty)
      const passwordProvided = formData.password.trim().length > 0;
      const confirmPasswordProvided = formData.confirmPassword.trim().length > 0;

      if (passwordProvided || confirmPasswordProvided) {
        if (formData.password !== formData.confirmPassword) {
          setSaveError('Passwords do not match!');
          return;
        }
        if (formData.password.length < 6) {
          setSaveError('Password must be at least 6 characters long!');
          return;
        }
      }

      // Prepare update data
      const updates = {
        username: formData.username,
        fullName: formData.fullName,
      };

      // Only include password if it's actually provided
      if (passwordProvided) {
        updates.password = formData.password;
      }

      await updateProfile(updates);

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handlePhotoSelect = (photoId) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === photosPosted.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photosPosted.map(p => p.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      // Delete each selected photo
      await Promise.all(selectedPhotos.map(photoId => deletePhoto(photoId)));

      // Refresh the photos list
      await fetchMyPhotos();

      // Clear selection
      setSelectedPhotos([]);
    } catch (error) {
      console.error('Error deleting photos:', error);
      alert('Failed to delete some photos. Please try again.');
    }
  };

  const handleRemoveHashtag = async (hashtag) => {
    try {
      await unfollowHashtag(hashtag);
    } catch (error) {
      console.error('Error unfollowing hashtag:', error);
    }
  };

  const handleFavoriteToggle = async (eventId) => {
    try {
      await toggleFavorite(eventId);

      // Immediately update local state for responsive UI
      setFavoriteEvents(prevFavorites => {
        const updatedFavorites = prevFavorites.filter(event => event.id !== eventId);

        // Adjust pagination if current page becomes empty
        const newTotalPages = Math.ceil(updatedFavorites.length / favoritesPerPage);
        if (favoritesPage >= newTotalPages && newTotalPages > 0) {
          setFavoritesPage(newTotalPages - 1);
        }

        return updatedFavorites;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Re-fetch on error to ensure consistency
      fetchFavoriteEvents();
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      await fetchMyEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleEditEvent = (eventId) => {
    // Navigate to event edit page (we'll create this later)
    navigate(`/events/${eventId}/edit`);
  };

  const handleCreateEvent = () => {
    // Navigate to create event page (we'll create this later)
    navigate('/events/create');
  };

  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const displayedFavorites = favoriteEvents.slice(
    favoritesPage * favoritesPerPage,
    (favoritesPage + 1) * favoritesPerPage
  );

  const totalFavoritesPages = Math.ceil(favoriteEvents.length / favoritesPerPage);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Profile Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-2">Profile</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] mx-auto mb-12"></div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
            {/* Left: Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {user?.profilePhoto ? (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src={user.profilePhoto}
                      alt={user.fullName || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center text-white text-5xl sm:text-6xl font-bold shadow-2xl">
                    {getUserInitials()}
                  </div>
                )}
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute bottom-2 right-2 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border-4 border-gray-50"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B6B]" />
                </button>
              </div>
              <p className="mt-6 text-gray-600 text-sm">
                {user?.userType === 'promoter' ? 'Promoter Account' : 'Partygoer Account'}
              </p>
            </div>

            {/* Right: Profile Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-5">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:opacity-60 transition-all"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent disabled:opacity-60 transition-all"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl disabled:opacity-60"
                  />
                </div>

                {isEditing && (
                  <>
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password (optional)
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="new password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="new password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Error Message */}
                {saveError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <p className="font-medium">Error</p>
                    <p>{saveError}</p>
                  </div>
                )}

                {/* Success Message */}
                {saveSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm">
                    Profile updated successfully!
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setSaveError('');
                          setSaveSuccess(false);
                          setFormData({
                            username: user?.username || '',
                            fullName: user?.fullName || '',
                            password: '',
                            confirmPassword: '',
                          });
                        }}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Events Section - Promoters Only */}
      {user?.userType === 'promoter' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-bold text-gray-900">My Events</h2>
              <button
                onClick={handleCreateEvent}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
            </div>

            {myEvents.length > 0 ? (
              <div className="relative">
                {/* Navigation Buttons */}
                {Math.ceil(myEvents.length / 3) > 1 && (
                  <>
                    <button
                      onClick={() => setMyEventsPage(prev => Math.max(0, prev - 1))}
                      disabled={myEventsPage === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10 border-2 border-gray-200"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#FF6B6B]" />
                    </button>
                    <button
                      onClick={() => setMyEventsPage(prev => Math.min(Math.ceil(myEvents.length / 3) - 1, prev + 1))}
                      disabled={myEventsPage === Math.ceil(myEvents.length / 3) - 1}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10 border-2 border-gray-200"
                    >
                      <ChevronRight className="w-6 h-6 text-[#FF6B6B]" />
                    </button>
                  </>
                )}

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.slice(myEventsPage * 3, (myEventsPage + 1) * 3).map((event) => (
                    <div key={event.id} className="relative">
                      <EventCard
                        event={event}
                        isFavorited={user?.favoriteEvents?.includes(event.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        currentUserId={user?.uid}
                      />
                      {/* Action Buttons Overlay */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleEditEvent(event.id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all border-2 border-gray-200"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4 text-[#FF6B6B]" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all border-2 border-gray-200"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-6">You haven't created any events yet.</p>
                  <button
                    onClick={handleCreateEvent}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {favoriteEvents.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Favorites</h2>

            <div className="relative">
              {/* Navigation Buttons */}
              {totalFavoritesPages > 1 && (
                <>
                  <button
                    onClick={() => setFavoritesPage(prev => Math.max(0, prev - 1))}
                    disabled={favoritesPage === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#FF6B6B]" />
                  </button>
                  <button
                    onClick={() => setFavoritesPage(prev => Math.min(totalFavoritesPages - 1, prev + 1))}
                    disabled={favoritesPage === totalFavoritesPages - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-[#FF6B6B]" />
                  </button>
                </>
              )}

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedFavorites.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorited={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    currentUserId={user?.uid}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Photos Posted Section */}
      {photosPosted.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-900">Photos Posted</h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.length === photosPosted.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-[#FF6B6B] focus:ring-[#FF6B6B]"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
                {selectedPhotos.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedPhotos.length})
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photosPosted.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => handlePhotoSelect(photo.id)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || `Posted photo ${photo.id}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 transition-opacity ${
                    selectedPhotos.includes(photo.id)
                      ? 'bg-[#FF6B6B]/40'
                      : 'bg-black/0 group-hover:bg-black/20'
                  }`}></div>
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.id)}
                    onChange={() => handlePhotoSelect(photo.id)}
                    className="absolute top-2 right-2 w-5 h-5 rounded border-2 border-white text-[#FF6B6B] focus:ring-[#FF6B6B] shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hashtags Followed Section */}
      {user?.followedHashtags && user.followedHashtags.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
              Hashtags Followed
            </h2>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {user.followedHashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full font-medium hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white transition-all duration-200"
                  >
                    <span>#{hashtag}</span>
                    <button
                      onClick={() => handleRemoveHashtag(hashtag)}
                      className="w-5 h-5 rounded-full bg-[#FF6B6B] group-hover:bg-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-white group-hover:text-[#FF6B6B]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoUploaded={(photoUrl) => {
          // AuthContext uses real-time Firestore listeners (onSnapshot)
          // so the user data will automatically update when Firestore changes
          // No need to reload - just close the modal
        }}
      />
    </div>
  );
};

export default Profile;
