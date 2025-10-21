import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CategoryCard Component
 *
 * Displays a category card with background image, gradient overlay, and category information.
 * Used for navigating to category-specific event listings.
 *
 * @param {Object} props - Component props
 * @param {Object} props.category - Category object containing category details
 * @param {string} props.category.name - Category name (e.g., "House Music", "Afrobeat")
 * @param {string} props.category.hashtag - Category hashtag (e.g., "#HouseMusic", "#Afrobeat")
 * @param {string} props.category.imageUrl - URL of the category background image
 * @param {Function} [props.onClick] - Optional callback when card is clicked
 */
const CategoryCard = ({ category, onClick }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick(category);
    } else {
      // Default behavior: navigate to category page
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${categorySlug}`);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] focus:ring-offset-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
      role="button"
      tabIndex={0}
      aria-label={`View ${category.name} events - ${category.hashtag}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={category.imageUrl}
          alt={`${category.name} category`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 animate-pulse">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"
                 role="status"
                 aria-label="Loading category image" />
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/30 group-hover:to-black/10 transition-all duration-300" />

      {/* Category Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          {category.name}
        </h3>
        <p className="text-white/90 text-sm md:text-base font-medium drop-shadow-md transform group-hover:scale-105 transition-transform duration-300">
          {category.hashtag.startsWith('#') ? category.hashtag : `#${category.hashtag}`}
        </p>
      </div>

      {/* Hover Effect - Subtle Border Glow */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/30 transition-all duration-300" />
    </div>
  );
};

export default CategoryCard;
