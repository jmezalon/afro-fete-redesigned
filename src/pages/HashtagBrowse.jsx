import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Hash, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Newsletter from '../components/Newsletter';
import HashtagFollowButton from '../components/HashtagFollowButton';
import { getTrendingHashtags, searchHashtags } from '../services/hashtagService';
import { useAuth } from '../context/AuthContext';

const HashtagBrowse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' or 'following'

  // Fetch trending hashtags on mount
  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  // Search when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const fetchTrendingHashtags = async () => {
    setLoading(true);
    try {
      const hashtags = await getTrendingHashtags(30);
      setTrendingHashtags(hashtags);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const results = await searchHashtags(searchTerm, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching hashtags:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/?hashtag=${encodeURIComponent(hashtag)}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Get followed hashtags with their details
  const getFollowedHashtagsWithDetails = () => {
    if (!user?.followedHashtags || user.followedHashtags.length === 0) {
      return [];
    }

    // Match followed hashtags with trending hashtags to get their details
    return user.followedHashtags
      .map(followedTag => {
        const hashtagDetails = trendingHashtags.find(
          trending => trending.name.toLowerCase() === followedTag.toLowerCase()
        );
        return hashtagDetails || {
          id: followedTag,
          name: followedTag,
          usageCount: 0
        };
      })
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  };

  const followedHashtagsWithDetails = getFollowedHashtagsWithDetails();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hash className="w-12 h-12 text-[#FF6B6B]" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
              Browse Hashtags
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Discover and follow hashtags to personalize your event feed
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search hashtags..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition-all"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Hash className="w-5 h-5" />
              Following ({user?.followedHashtags?.length || 0})
            </button>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchTerm.trim() && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results for "{searchTerm}"
            </h2>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-[#FF6B6B] transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <button
                        onClick={() => handleHashtagClick(hashtag.name)}
                        className="text-2xl font-bold text-[#FF6B6B] hover:text-[#ff5252] hover:underline transition-colors"
                      >
                        #{hashtag.name}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {hashtag.usageCount || 0} {hashtag.usageCount === 1 ? 'use' : 'uses'}
                      </p>
                      <HashtagFollowButton
                        hashtag={hashtag.name}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : !searching ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hashtags found for "{searchTerm}"</p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Trending Hashtags Tab */}
      {!searchTerm.trim() && activeTab === 'trending' && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Trending Hashtags
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trendingHashtags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trendingHashtags.map((hashtag, index) => (
                  <div
                    key={hashtag.id}
                    className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-[#FF6B6B] transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <button
                        onClick={() => handleHashtagClick(hashtag.name)}
                        className="text-2xl font-bold text-[#FF6B6B] hover:text-[#ff5252] hover:underline transition-colors"
                      >
                        #{hashtag.name}
                      </button>
                      {index < 5 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {hashtag.usageCount || 0} {hashtag.usageCount === 1 ? 'use' : 'uses'}
                      </p>
                      <HashtagFollowButton
                        hashtag={hashtag.name}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No trending hashtags available</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Following Tab */}
      {!searchTerm.trim() && activeTab === 'following' && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Hashtags You Follow
            </h2>

            {!user ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl max-w-md mx-auto">
                <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-6">
                  Sign in to follow hashtags and personalize your feed
                </p>
                <button
                  onClick={() => navigate('/signin')}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              </div>
            ) : followedHashtagsWithDetails.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {followedHashtagsWithDetails.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border-2 border-[#FF6B6B] p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <button
                        onClick={() => handleHashtagClick(hashtag.name)}
                        className="text-2xl font-bold text-[#FF6B6B] hover:text-[#ff5252] hover:underline transition-colors"
                      >
                        #{hashtag.name}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {hashtag.usageCount || 0} {hashtag.usageCount === 1 ? 'use' : 'uses'}
                      </p>
                      <HashtagFollowButton
                        hashtag={hashtag.name}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl max-w-md mx-auto">
                <Hash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-6">
                  You're not following any hashtags yet
                </p>
                <button
                  onClick={() => setActiveTab('trending')}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white rounded-full font-semibold hover:from-[#ff5252] hover:to-[#FF6B6B] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Explore Trending
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HashtagBrowse;
