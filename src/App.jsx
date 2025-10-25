import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, PublicRoute } from './context/AuthContext';
import './App.css';

// Pages
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import FirebaseTest from './pages/FirebaseTest';
import CategoryView from './pages/CategoryView';
import EventDetail from './pages/EventDetail';
import PhotoGallery from './pages/PhotoGallery';
import CreateEvent from './pages/CreateEvent';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import HashtagBrowse from './pages/HashtagBrowse';
import PromoterProfile from './pages/PromoterProfile';
import PromotersList from './pages/PromotersList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/firebase-test" element={<FirebaseTest />} />

          {/* Category and Event Routes */}
          <Route path="/category/:categoryName" element={<CategoryView />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/promoters" element={<PromotersList />} />
          <Route path="/promoter/:promoterId" element={<PromoterProfile />} />
          <Route path="/photos" element={<PhotoGallery />} />
          <Route path="/hashtags" element={<HashtagBrowse />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
