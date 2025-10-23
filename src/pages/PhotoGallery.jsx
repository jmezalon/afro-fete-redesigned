import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Upload, User, Calendar, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import PhotoUploadModal from '../components/PhotoUploadModal';
import { getAllPhotos, getPhotosByHashtag } from '../services/photoService';
import { getTrendingHashtags } from '../services/hashtagService';
import { useAuth } from '../context/AuthContext';

const PhotoGallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState((searchParams.get('hashtag') || '').toLowerCase());
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchPhotos(true);
    fetchTrendingHashtags();
  }, [selectedHashtag]);

  useEffect(() => {
    const hashtagFromUrl = searchParams.get('hashtag');
    if (hashtagFromUrl) {
      setSelectedHashtag(hashtagFromUrl.toLowerCase());
    }
  }, [searchParams]);

  const fetchTrendingHashtags = async () => {
    try {
      const hashtags = await getTrendingHashtags(10);
      setTrendingHashtags(hashtags);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    }
  };

  const fetchPhotos = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let result;
      const options = {
        limit: 20,
        lastDoc: reset ? null : lastDoc,
      };

      if (selectedHashtag) {
        result = await getPhotosByHashtag(selectedHashtag, options);
      } else {
        result = await getAllPhotos(options);
      }

      if (reset) {
        setPhotos(result.photos);
      } else {
        setPhotos(prev => [...prev, ...result.photos]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleUploadClick = () => {
    if (!user) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchPhotos(true);
  };

  const handleHashtagClick = (hashtag) => {
    const cleanHashtag = (hashtag.startsWith('#') ? hashtag.slice(1) : hashtag).toLowerCase();
    setSelectedHashtag(cleanHashtag);
    setSearchParams({ hashtag: cleanHashtag });
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const cleanHashtag = (searchQuery.startsWith('#') ? searchQuery.slice(1) : searchQuery).toLowerCase();
      setSelectedHashtag(cleanHashtag);
      setSearchParams({ hashtag: cleanHashtag });
    }
  };

  const handleClearFilter = () => {
    setSelectedHashtag('');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleLoadMore = () => {
    fetchPhotos(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Header Section */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Photo Gallery
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Explore moments captured by our community
            </p>
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Post a Photo
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-3xl mx-auto mt-12">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos by hashtag... ex. #brunch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:outline-none transition-all shadow-sm"
              />
            </form>

            {/* Active Filter Display */}
            {selectedHashtag && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-sm font-medium text-gray-600">Filtering by:</span>
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white px-4 py-2 rounded-full text-sm font-medium">
                  #{selectedHashtag}
                </span>
                <button
                  onClick={handleClearFilter}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}

            {/* Trending Hashtags */}
            {trendingHashtags.length > 0 && (
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Hashtags</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {trendingHashtags.map((hashtag) => (
                    <button
                      key={hashtag.id}
                      onClick={() => handleHashtagClick(hashtag.name)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                        selectedHashtag === hashtag.name
                          ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white'
                          : 'bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white hover:border-transparent'
                      }`}
                    >
                      #{hashtag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photos Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : photos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo)}
                    className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || 'Event photo'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        {photo.caption && (
                          <p className="text-sm font-medium mb-1 line-clamp-2">
                            {photo.caption}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3" />
                          <span>{photo.userName || 'Anonymous'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-10 py-4 bg-white border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full font-semibold hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white hover:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Photos'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-6">
                  {selectedHashtag
                    ? `No photos found for #${selectedHashtag}`
                    : 'No photos yet. Be the first to share!'}
                </p>
                {selectedHashtag ? (
                  <button
                    onClick={handleClearFilter}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Clear Filter
                  </button>
                ) : (
                  <button
                    onClick={handleUploadClick}
                    className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Post a Photo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                aria-label="Close modal"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>

              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption || 'Event photo'}
                className="w-full max-h-[60vh] object-contain bg-gray-100"
              />

              <div className="p-6">
                {selectedPhoto.caption && (
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedPhoto.caption}
                  </h3>
                )}

                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FF6B6B]" />
                    <span>Posted by: {selectedPhoto.userName || 'Anonymous'}</span>
                  </div>

                  {selectedPhoto.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#FF6B6B]" />
                      <span>
                        {format(new Date(selectedPhoto.createdAt), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {selectedPhoto.hashtags && selectedPhoto.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedPhoto.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-[#FF6B6B] rounded-full text-sm font-medium"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Newsletter */}
      <Newsletter />

      <Footer />
    </div>
  );
};

export default PhotoGallery;
