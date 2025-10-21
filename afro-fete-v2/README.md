# Afro Fete V2

A modern event management platform built with React, Vite, and Firebase.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend services (Auth, Firestore, Storage)
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **date-fns** - Date utility library

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── context/        # React Context (AuthContext, etc.)
├── services/       # Firebase service files
├── config/         # Configuration files (Firebase, etc.)
├── data/           # Seed data and mock data
└── utils/          # Helper functions and utilities
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/jmezalon/afro-fete-redesigned.git
cd afro-fete-redesigned/afro-fete-v2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials

4. Start the development server
```bash
npm run dev
```

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config to the `.env` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

### Colors

- **Primary Coral**: `#FF6B6B`
- **Light Coral**: `#FFB4B4` (borders)
- **Light Gray**: `#F5F5F5`
- **Dark Text**: `#2D2D2D`

### Typography

- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

## License

MIT
