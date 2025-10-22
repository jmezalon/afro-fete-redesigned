// Event category constants and configuration
// Using Unsplash images (same as Landing page)

export const EVENT_CATEGORIES = [
  {
    id: 'brunch',
    name: 'brunch',
    hashtag: '#brunch',
    displayName: 'Brunch',
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=500',
    description: 'Brunch events and experiences'
  },
  {
    id: 'festivals',
    name: 'festivals',
    hashtag: '#festivals',
    displayName: 'Festivals',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500',
    description: 'Music festivals and cultural celebrations'
  },
  {
    id: 'nightlife',
    name: 'nightlife',
    hashtag: '#nightlife',
    displayName: 'Nightlife',
    image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=500',
    description: 'Clubs, parties, and nightlife events'
  },
  {
    id: 'afterwork',
    name: 'afterwork',
    hashtag: '#afterwork',
    displayName: 'After Work',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
    description: 'After-work social events and happy hours'
  },
  {
    id: 'arts',
    name: 'arts',
    hashtag: '#arts',
    displayName: 'Arts',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
    description: 'Art exhibitions, galleries, and cultural events'
  },
  {
    id: 'concerts',
    name: 'concerts',
    hashtag: '#concerts',
    displayName: 'Concerts',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500',
    description: 'Live music and concert performances'
  },
  {
    id: 'dayparty',
    name: 'dayparty',
    hashtag: '#dayparty',
    displayName: 'Day Party',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
    description: 'Daytime parties and social gatherings'
  },
  {
    id: 'boatrides',
    name: 'boatrides',
    hashtag: '#boatrides',
    displayName: 'Boat Rides',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
    description: 'Boat parties and water-based events'
  }
];

// Helper function to get category by ID
export const getCategoryById = (id) => {
  return EVENT_CATEGORIES.find(category => category.id === id);
};

// Helper function to get category by hashtag
export const getCategoryByHashtag = (hashtag) => {
  return EVENT_CATEGORIES.find(category => category.hashtag === hashtag);
};

// Export category IDs for easy reference
export const CATEGORY_IDS = {
  BRUNCH: 'brunch',
  FESTIVALS: 'festivals',
  NIGHTLIFE: 'nightlife',
  AFTERWORK: 'afterwork',
  ARTS: 'arts',
  CONCERTS: 'concerts',
  DAYPARTY: 'dayparty',
  BOATRIDES: 'boatrides',
};
