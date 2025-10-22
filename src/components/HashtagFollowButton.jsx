import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * HashtagFollowButton Component
 *
 * Displays a button that allows users to follow/unfollow hashtags.
 *
 * @param {Object} props - Component props
 * @param {string} props.hashtag - The hashtag name (with or without #)
 * @param {string} [props.variant] - Button style variant: 'primary', 'outline', or 'minimal' (default: 'outline')
 * @param {string} [props.size] - Button size: 'sm', 'md', or 'lg' (default: 'md')
 * @param {Function} [props.onFollowChange] - Callback when follow state changes
 */
const HashtagFollowButton = ({
  hashtag,
  variant = 'outline',
  size = 'md',
  onFollowChange
}) => {
  const { user, followHashtag, unfollowHashtag } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Normalize hashtag (remove # if present)
  const normalizedHashtag = hashtag.replace('#', '').toLowerCase().trim();

  // Check if user is following this hashtag
  const isFollowing = user?.followedHashtags?.includes(normalizedHashtag) || false;

  // Handle follow/unfollow click
  const handleClick = async (e) => {
    e.stopPropagation();

    // Redirect to signin if not authenticated
    if (!user) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }

    setIsProcessing(true);

    try {
      if (isFollowing) {
        await unfollowHashtag(normalizedHashtag);
      } else {
        await followHashtag(normalizedHashtag);
      }

      // Call optional callback
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling hashtag follow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Variant classes
  const variantClasses = {
    primary: isFollowing
      ? 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white border-2 border-transparent hover:from-[#ff5252] hover:to-[#FF6B6B]'
      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-2 border-gray-300 hover:from-gray-200 hover:to-gray-300',
    outline: isFollowing
      ? 'bg-gradient-to-r from-pink-50 to-red-50 border-2 border-[#FF6B6B] text-[#FF6B6B] hover:from-[#FF6B6B] hover:to-[#FF8E8E] hover:text-white'
      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#FF6B6B] hover:text-[#FF6B6B]',
    minimal: isFollowing
      ? 'bg-transparent text-[#FF6B6B] hover:bg-pink-50'
      : 'bg-transparent text-gray-600 hover:bg-gray-100'
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        transition-all duration-200 shadow-sm hover:shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-1
        transform hover:scale-105
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
      aria-label={isFollowing ? `Unfollow #${normalizedHashtag}` : `Follow #${normalizedHashtag}`}
      aria-pressed={isFollowing}
    >
      {isProcessing ? (
        <div
          className={`border-2 border-current border-t-transparent rounded-full animate-spin ${iconSizes[size]}`}
          role="status"
          aria-label="Loading"
        />
      ) : isFollowing ? (
        <Check className={iconSizes[size]} />
      ) : (
        <Plus className={iconSizes[size]} />
      )}
      <span>{isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
};

export default HashtagFollowButton;
