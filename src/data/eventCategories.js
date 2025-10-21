// Event category constants and configuration
// Images are located in src/assets/event-category/

export const EVENT_CATEGORIES = [
  {
    id: 'brunch',
    name: 'brunch',
    hashtag: '#brunch',
    displayName: 'Brunch',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.03 AM.png',
    description: 'Brunch events and experiences'
  },
  {
    id: 'festivals',
    name: 'festivals',
    hashtag: '#festivals',
    displayName: 'Festivals',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.14 AM.png',
    description: 'Music festivals and cultural celebrations'
  },
  {
    id: 'nightlife',
    name: 'nightlife',
    hashtag: '#nightlife',
    displayName: 'Nightlife',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.34 AM.png',
    description: 'Clubs, parties, and nightlife events'
  },
  {
    id: 'afterwork',
    name: 'afterwork',
    hashtag: '#afterwork',
    displayName: 'After Work',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.45 AM.png',
    description: 'After-work social events and happy hours'
  },
  {
    id: 'arts',
    name: 'arts',
    hashtag: '#arts',
    displayName: 'Arts',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.56 AM.png',
    description: 'Art exhibitions, galleries, and cultural events'
  },
  {
    id: 'concerts',
    name: 'concerts',
    hashtag: '#concerts',
    displayName: 'Concerts',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.18.57 AM.png',
    description: 'Live music and concert performances'
  },
  {
    id: 'dayparty',
    name: 'dayparty',
    hashtag: '#dayparty',
    displayName: 'Day Party',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.19.16 AM.png',
    description: 'Daytime parties and social gatherings'
  },
  {
    id: 'boatrides',
    name: 'boatrides',
    hashtag: '#boatrides',
    displayName: 'Boat Rides',
    image: '/src/assets/event-category/Screenshot 2025-10-21 at 11.19.27 AM.png',
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
