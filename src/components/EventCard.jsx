import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';

/**
 * EventCard Component
 *
 * Displays an event in a card format with image, date, details, and favorite functionality.
 *
 * @param {Object} props - Component props
 * @param {Object} props.event - Event object containing event details
 * @param {string} props.event.id - Unique event identifier
 * @param {string} props.event.name - Event name
 * @param {string} props.event.venueName - Venue name where event takes place
 * @param {string} props.event.address - Full address of the venue
 * @param {string} props.event.flyerUrl - URL of the event flyer image
 * @param {Date|string} props.event.date - Event date (Date object or date string)
 * @param {string[]} props.event.hashtags - Array of hashtags associated with the event
 * @param {Function} props.onFavoriteToggle - Callback function when favorite is toggled
 * @param {boolean} props.isFavorited - Whether the event is currently favorited
 * @param {Function} [props.onHashtagClick] - Optional callback when hashtag is clicked
 */
const EventCard = ({
  event,
  onFavoriteToggle,
  isFavorited,
  onHashtagClick
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Parse date if it's a string
  const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;

  // Format date for display
  const month = format(eventDate, 'MMM').toUpperCase();
  const day = format(eventDate, 'd');

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on interactive elements
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('[data-hashtag]')
    ) {
      return;
    }
    navigate(`/events/${event.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle(event.id);
  };

  const handleHashtagClick = (e, hashtag) => {
    e.stopPropagation();
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    } else {
      // Default behavior: navigate to events page with hashtag filter
      navigate(`/events?hashtag=${encodeURIComponent(hashtag)}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
      role="article"
      aria-label={`Event: ${event.name}`}
    >
      {/* Event Flyer Image */}
      <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
        <img
          src={event.flyerUrl}
          alt={`${event.name} event flyer`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="w-8 h-8 border-4 border-[#FF6B6B] border-t-transparent rounded-full animate-spin"
                 role="status"
                 aria-label="Loading image" />
          </div>
        )}
      </div>

      {/* Event Details Section */}
      <div className="p-4 relative">
        {/* Favorite Button - Top Right */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 z-10"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorited}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              isFavorited
                ? 'fill-[#FF6B6B] stroke-[#FF6B6B]'
                : 'stroke-gray-600 hover:stroke-[#FF6B6B]'
            }`}
          />
        </button>

        {/* Date and Details Container */}
        <div className="flex gap-4">
          {/* Date Box */}
          <div className="flex-shrink-0 w-16 h-16 bg-[#FF6B6B] rounded-lg flex flex-col items-center justify-center text-white shadow-md">
            <span className="text-xs font-semibold leading-none">{month}</span>
            <span className="text-2xl font-bold leading-none mt-1">{day}</span>
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0 pr-12">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#FF6B6B] transition-colors duration-200">
              {event.name}
            </h3>
            <p className="text-sm font-medium text-gray-700 mb-1 truncate">
              {event.venueName}
            </p>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {event.address}
            </p>

            {/* Hashtags */}
            {event.hashtags && event.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {event.hashtags.slice(0, 3).map((hashtag, index) => (
                  <button
                    key={index}
                    data-hashtag
                    onClick={(e) => handleHashtagClick(e, hashtag)}
                    className="text-xs text-[#FF6B6B] hover:text-[#ff5252] hover:underline font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-1 rounded px-1"
                    aria-label={`Filter by ${hashtag}`}
                  >
                    {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                  </button>
                ))}
                {event.hashtags.length > 3 && (
                  <span className="text-xs text-gray-400 font-medium">
                    +{event.hashtags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
